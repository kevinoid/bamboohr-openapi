/**
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

function schemaToDescription(schema) {
  let description = schema.description || '';
  if (schema.readOnly) {
    description = `(Read-Only) ${description}`;
  }
  if (schema.deprecated) {
    description = `(Deprecated) ${description}`;
  }
  return description;
}

function propertiesToEnum(properties) {
  const propNames = Object.keys(properties);
  return {
    type: 'string',
    enum: propNames,
    'x-enum-descriptions':
      propNames.map((name) => schemaToDescription(properties[name])),
  };
}

/**
 * Transformer to generate the EmployeeFieldName enum from defined properties
 * of the Employee schema.
 */
export default class GenerateEmployeeFieldNamesTransformer
  extends OpenApiTransformerBase {
  // eslint-disable-next-line class-methods-use-this
  transformComponents(components) {
    return {
      ...components,
      schemas: {
        ...components.schemas,
        EmployeeFieldName: {
          ...components.schemas.EmployeeFieldName,
          ...propertiesToEnum(components.schemas.Employee.properties),
          // Model as a string, since custom properties can be added at any time
          'x-ms-enum': {
            name: 'EmployeeFieldName',
            modelAsString: true,
          },
        },
      },
    };
  }

  transformOpenApi(openApi) {
    return {
      ...openApi,
      components: this.transformComponents(openApi.components),
    };
  }
}
