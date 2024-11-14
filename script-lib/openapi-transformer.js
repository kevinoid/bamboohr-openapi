/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerPipeline from '@kevinoid/openapi-transformer-pipeline';

import AddCountryCodeNamesTransformer from './add-country-code-names.js';
import GenerateEmployeeFieldNamesTransformer
  from './generate-employee-fields.js';

/**
 * Transformer to build the BambooHR OpenAPI document.
 */
export default class OpenApiTransformer extends OpenApiTransformerPipeline {
  constructor() {
    super([
      new GenerateEmployeeFieldNamesTransformer(),
      new AddCountryCodeNamesTransformer(),
    ]);
  }
}
