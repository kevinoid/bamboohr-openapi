/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerPipeline from '@kevinoid/openapi-transformer-pipeline';
import AddTagToOperationIdsTransformer
  from '@kevinoid/openapi-transformers/add-tag-to-operation-ids.js';
import AddXMsEnumNameTransformer
  from '@kevinoid/openapi-transformers/add-x-ms-enum-name.js';
import AddXMsEnumValueNamesTransformer
  from '@kevinoid/openapi-transformers/add-x-ms-enum-value-names.js';
import AdditionalPropertiesToUnconstrainedTransformer from
  '@kevinoid/openapi-transformers/additional-properties-to-unconstrained.js';
import AssertPropertiesTransformer
  from '@kevinoid/openapi-transformers/assert-properties.js';
import BinaryStringToFileTransformer
  from '@kevinoid/openapi-transformers/binary-string-to-file.js';
import ClearHtmlResponseSchemaTransformer
  from '@kevinoid/openapi-transformers/clear-html-response-schema.js';
import ClientParamsToGlobalTransformer
  from '@kevinoid/openapi-transformers/client-params-to-global.js';
import EscapeEnumValuesTransformer
  from '@kevinoid/openapi-transformers/escape-enum-values.js';
import FormatToTypeTransformer
  from '@kevinoid/openapi-transformers/format-to-type.js';
import InlineNonObjectSchemaTransformer
  from '@kevinoid/openapi-transformers/inline-non-object-schemas.js';
import MergeAllOfTransformer
  from '@kevinoid/openapi-transformers/merge-all-of.js';
import MergeAnyOfTransformer
  from '@kevinoid/openapi-transformers/merge-any-of.js';
import NullableNotRequiredTransformer
  from '@kevinoid/openapi-transformers/nullable-not-required.js';
import OpenApi31To30Transformer from
  '@kevinoid/openapi-transformers/openapi31to30.js';
import PathParametersToOperationTransformer
  from '@kevinoid/openapi-transformers/path-parameters-to-operations.js';
import QueriesToXMsPathsTransformer
  from '@kevinoid/openapi-transformers/queries-to-x-ms-paths.js';
import ReadOnlyNotRequiredTransformer
  from '@kevinoid/openapi-transformers/read-only-not-required.js';
import RefPathParametersTransformer
  from '@kevinoid/openapi-transformers/ref-path-parameters.js';
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
import ServerVarsToPathParamsTransformer
  from '@kevinoid/openapi-transformers/server-vars-to-path-params.js';
import ServerVarsToParamHostTransformer from
  '@kevinoid/openapi-transformers/server-vars-to-x-ms-parameterized-host.js';
import UrlencodedToStringTransformer
  from '@kevinoid/openapi-transformers/urlencoded-to-string.js';
import XEnumToXMsEnumTransformer
  from '@kevinoid/openapi-transformers/x-enum-to-ms.js';

import AddCountryCodeNamesTransformer from './add-country-code-names.js';
import CapitalizeCurrencyCodeTransformer from './capitalize-currency-code.js';
import GenerateEmployeeFieldNamesTransformer
  from './generate-employee-fields.js';
import bambooHrV3ToV2Factory from './oas3-to-oas2.js';
import RemoveAnyOfEmptyArrayTransformer from './remove-any-of-empty-array.js';
import SimplifyBambooHRTransformer from './simplify-bamboo-hr.js';

/**
 * Transformer to convert the BambooHR OpenAPI document to a format suitable
 * for use by Autorest version 2.
 */
export default class Autorest2Transformer extends OpenApiTransformerPipeline {
  constructor() {
    super([
      new GenerateEmployeeFieldNamesTransformer(),
      new AddCountryCodeNamesTransformer(),
      new SimplifyBambooHRTransformer(),
      new OpenApi31To30Transformer(),
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
      new EscapeEnumValuesTransformer({ language: 'csharp' }),
      new XEnumToXMsEnumTransformer(),
      new AddXMsEnumValueNamesTransformer(),
      new CapitalizeCurrencyCodeTransformer(),
      new MergeAllOfTransformer({ onlySingle: true }),
      new MergeAnyOfTransformer(),
      new RemoveRefSiblingsTransformer({ remove: ['xml'] }),
      new RemoveResponseHeadersTransformer(),
      new RemovePathsWithServersTransformer(),
      new ClearHtmlResponseSchemaTransformer(),
      // Note: Removes properties of $ref parent required in child.
      // This is a bug in NullableNotRequiredTransformer, but is the desired
      // behavior, since Autorest doesn't support it and OAV produces
      // OBJECT_MISSING_REQUIRED_PROPERTY_DEFINITION errors for it.
      new NullableNotRequiredTransformer(),
      new PathParametersToOperationTransformer(),
      new ServerVarsToPathParamsTransformer({ omitDefault: ['subdomain'] }),
      new ServerVarsToParamHostTransformer({ omitDefault: ['subdomain'] }),
      new ReadOnlyNotRequiredTransformer({
        removeValidation: true,
        setNonNullable: true,
      }),
      // Assert that properties not convertible to Swagger are not present
      new AssertPropertiesTransformer({
        schema: {
          excludes: [
            'anyOf',
            'const',
            'contains',
            'not',
            'oneOf',
            'patternProperties',
            'prefixItems',
            'propertyNames',
            'unevaluatedItems',
          ],
        },
      }),
      bambooHrV3ToV2Factory(),
      new BinaryStringToFileTransformer(),
      new AddTagToOperationIdsTransformer({ tagSuffix: 'Api' }),
      new UrlencodedToStringTransformer(),
      new ClientParamsToGlobalTransformer(),
      new RefPathParametersTransformer(),
      new InlineNonObjectSchemaTransformer(),
      new QueriesToXMsPathsTransformer(),
    ]);
  }
}
