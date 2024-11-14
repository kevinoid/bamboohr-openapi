/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerPipeline from '@kevinoid/openapi-transformer-pipeline';
import ClientParamsToGlobalTransformer
  from '@kevinoid/openapi-transformers/client-params-to-global.js';
import PatternPropertiesToAdditionalPropertiesTransformer from
  '@kevinoid/openapi-transformers/pattern-properties-to-additional-properties.js';
import RefPathParametersTransformer
  from '@kevinoid/openapi-transformers/ref-path-parameters.js';
import RemovePathsWithServersTransformer
  from '@kevinoid/openapi-transformers/remove-paths-with-servers.js';
import ServerVarsToPathParamsTransformer
  from '@kevinoid/openapi-transformers/server-vars-to-path-params.js';
import ServerVarsToParamHostTransformer from
  '@kevinoid/openapi-transformers/server-vars-to-x-ms-parameterized-host.js';

import AddCountryCodeNamesTransformer from './add-country-code-names.js';
import GenerateEmployeeFieldNamesTransformer
  from './generate-employee-fields.js';
import bambooHrV3ToV2Factory from './oas3-to-oas2.js';

/**
 * Transformer to convert the BambooHR OpenAPI document to OpenAPI 2 (fka
 * Swagger).
 */
export default class SwaggerTransformer extends OpenApiTransformerPipeline {
  constructor() {
    super([
      new GenerateEmployeeFieldNamesTransformer(),
      new AddCountryCodeNamesTransformer(),
      new PatternPropertiesToAdditionalPropertiesTransformer(),
      new RemovePathsWithServersTransformer(),
      new ServerVarsToPathParamsTransformer({ omitDefault: ['subdomain'] }),
      new ServerVarsToParamHostTransformer({ omitDefault: ['subdomain'] }),
      bambooHrV3ToV2Factory(),
      new ClientParamsToGlobalTransformer(),
      new RefPathParametersTransformer(),
    ]);
  }
}
