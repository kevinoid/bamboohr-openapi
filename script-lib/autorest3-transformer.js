/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerPipeline from '@kevinoid/openapi-transformer-pipeline';
import AddTagToOperationIdsTransformer
  from '@kevinoid/openapi-transformers/add-tag-to-operation-ids.js';
import AddXMsEnumNameTransformer
  from '@kevinoid/openapi-transformers/add-x-ms-enum-name.js';
import AdditionalPropertiesToUnconstrainedTransformer from
  '@kevinoid/openapi-transformers/additional-properties-to-unconstrained.js';
import ClearHtmlResponseSchemaTransformer
  from '@kevinoid/openapi-transformers/clear-html-response-schema.js';
import FormatToTypeTransformer
  from '@kevinoid/openapi-transformers/format-to-type.js';
import MergeSubschemasTransformer
  from '@kevinoid/openapi-transformers/merge-subschemas.js';
import PathParametersToOperationTransformer
  from '@kevinoid/openapi-transformers/path-parameters-to-operations.js';
import PatternPropertiesToAdditionalPropertiesTransformer from
  '@kevinoid/openapi-transformers/pattern-properties-to-additional-properties.js';
import QueriesToXMsPathsTransformer
  from '@kevinoid/openapi-transformers/queries-to-x-ms-paths.js';
import RemovePathsWithServersTransformer
  from '@kevinoid/openapi-transformers/remove-paths-with-servers.js';
import RemoveRefSiblingsTransformer
  from '@kevinoid/openapi-transformers/remove-ref-siblings.js';
import RemoveResponseHeadersTransformer
  from '@kevinoid/openapi-transformers/remove-response-headers.js';
import RenameComponentsTransformer
  from '@kevinoid/openapi-transformers/rename-components.js';
import ReplacedByToDescriptionTransformer
  from '@kevinoid/openapi-transformers/replaced-by-to-description.js';
import XEnumToXMsEnumTransformer
  from '@kevinoid/openapi-transformers/x-enum-to-ms.js';

import AddCountryCodeNamesTransformer from './add-country-code-names.js';
import CapitalizeCurrencyCodeTransformer from './capitalize-currency-code.js';
import GenerateEmployeeFieldNamesTransformer
  from './generate-employee-fields.js';
import RemoveAnyOfEmptyArrayTransformer from './remove-any-of-empty-array.js';

function skipAllOf(allOf) {
  // Only merge allOf which contains a single element.
  return allOf.length > 1;
}

/**
 * Transformer to convert the BambooHR OpenAPI document to a format suitable
 * for use by Autorest version 3.
 */
export default class Autorest3Transformer extends OpenApiTransformerPipeline {
  constructor() {
    super([
      new GenerateEmployeeFieldNamesTransformer(),
      new AddCountryCodeNamesTransformer(),
      new PatternPropertiesToAdditionalPropertiesTransformer(),
      new RemoveAnyOfEmptyArrayTransformer(),
      new RenameComponentsTransformer({
        schemas: {
          '^EEOJobCategory$': 'EeoJobCategory',
        },
      }),
      new AdditionalPropertiesToUnconstrainedTransformer(),
      new ReplacedByToDescriptionTransformer(),
      new FormatToTypeTransformer(),
      new AddXMsEnumNameTransformer(),
      new XEnumToXMsEnumTransformer(),
      new CapitalizeCurrencyCodeTransformer(),
      new MergeSubschemasTransformer({ skipAllOf }),
      new RemoveRefSiblingsTransformer({ remove: ['xml'] }),
      new RemoveResponseHeadersTransformer(),
      new RemovePathsWithServersTransformer(),
      new ClearHtmlResponseSchemaTransformer(),
      new PathParametersToOperationTransformer(),
      new AddTagToOperationIdsTransformer({ tagSuffix: 'Api' }),
      new QueriesToXMsPathsTransformer(),
    ]);
  }
}
