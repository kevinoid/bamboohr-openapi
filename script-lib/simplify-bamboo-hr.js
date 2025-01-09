/**
 * @copyright Copyright 2025 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import assert from 'node:assert';

function simplifyEmployeeDependent(openApi) {
  const properties =
    openApi?.components?.schemas?.EmployeeDependent?.properties;

  const {
    anyOf: stateAnyOf,
    ...stateNoAnyOf
  } = properties?.state ?? {};
  assert.deepStrictEqual(
    stateAnyOf,
    [
      { const: false },
      { $ref: '#/components/schemas/ProvinceCode' },
      { $ref: '#/components/schemas/StateCode' },
      { $ref: '#/components/schemas/ProvinceName' },
      { $ref: '#/components/schemas/StateName' },
    ],
  );

  const {
    anyOf: countryAnyOf,
    ...countryNoAnyOf
  } = properties?.country ?? {};
  assert.deepStrictEqual(
    countryAnyOf,
    [
      { $ref: '#/components/schemas/Country' },
      { $ref: '#/components/schemas/CountryCode' },
      { type: 'null' },
    ],
  );

  return {
    ...openApi,
    components: {
      ...openApi.components,
      schemas: {
        ...openApi.components.schemas,
        EmployeeDependent: {
          ...openApi.components.schemas.EmployeeDependent,
          properties: {
            ...properties,
            state: {
              ...stateNoAnyOf,
              type: 'string',
            },
            country: {
              ...countryNoAnyOf,
              type: 'string',
              nullable: true,
            },
          },
        },
      },
    },
  };
}

/**
 * Transformer to simplify the BambooHR OpenAPI document for conversion for
 * use by Autorest or conversion from OpenAPI 3 to OpenAPI 2.
 */
export default class SimplifyBambooHRTransformer {
  // eslint-disable-next-line class-methods-use-this
  transformOpenApi(openApi) {
    if (typeof openApi !== 'object' || openApi === null) {
      throw new TypeError('openApi must be an object');
    }

    openApi = simplifyEmployeeDependent(openApi);

    return openApi;
  }
}
