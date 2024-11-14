/**
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import './jgexml-issue17-workaround.js';

// jgexml workaround must be imported before api-spec-converter
// eslint-disable-next-line import/order
import Converter from 'api-spec-converter';

async function convertXMsParameterizedHost(format) {
  const xMsParamHost = format.spec['x-ms-parameterized-host'];
  const hostParams = xMsParamHost && xMsParamHost.parameters;
  if (!Array.isArray(hostParams) || hostParams.length === 0) {
    return format;
  }

  // Convert an dummy OpenAPI 3 document using the host parameters
  const dummy2 = await Converter.convert({
    from: 'openapi_3',
    to: 'swagger_2',
    source: {
      openapi: '3.0.3',
      info: {
        title: 'Dummy',
        version: '1.0.0',
      },
      paths: {
        '/dummy': {
          parameters: hostParams,
        },
      },
    },
  });

  // Merge the converted parameters
  return {
    ...format,
    spec: {
      ...format.spec,
      'x-ms-parameterized-host': {
        ...xMsParamHost,
        parameters: dummy2.spec.paths['/dummy'].parameters,
      },
    },
  };
}

function tuneBambooHrV2Spec(v2Spec) {
  const spec = {
    ...v2Spec,
    definitions: { ...v2Spec.definitions },
  };

  // Remove request schemas which were converted to formData parameters
  // TODO: Generic schema removal if no $refs or discriminators remain
  delete spec.definitions.LoginRequest;
  delete spec.definitions.UploadFileRequest;
  delete spec.definitions.UploadPhotoRequest;

  delete spec['x-components'];
  delete spec['x-suppress-warning'];

  return spec;
}

async function bambooHrV3ToV2(openApi) {
  if (typeof openApi !== 'object' || openApi === null) {
    return openApi;
  }

  const format = await Converter.convert({
    from: 'openapi_3',
    source: {
      ...openApi,
      // api-spec-converter only supports 3.0.*, regardless of features:
      // https://github.com/LucyBot-Inc/api-spec-converter/issues/303
      openapi: /^3\.[^0]/.test(openApi.openapi) ? '3.0.3' : openApi.openapi,
    },
    to: 'swagger_2',
  });
  const { spec } = await convertXMsParameterizedHost(format);
  return tuneBambooHrV2Spec(spec);
}

/**
 * Transformer to convert the OpenAPI 3 spec for the BambooHR API to OpenAPI 2.
 *
 * @returns {!{transformOpenApi: function(!object):!object}} An object
 * conforming with the OpenApiTransformerBase convention.
 */
export default function bambooHrV3ToV2Factory() {
  return { transformOpenApi: bambooHrV3ToV2 };
}
