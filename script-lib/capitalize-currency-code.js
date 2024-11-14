/**
 * @copyright Copyright 2021 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import OpenApiTransformerBase from 'openapi-transformer-base';

/**
 * Transformer to rename CountryCode enumeration values to all upper-case.
 */
export default class CapitalizeCurrencyCodeTransformer
  extends OpenApiTransformerBase {
  // eslint-disable-next-line class-methods-use-this
  transformSchema(schema) {
    if (typeof schema !== 'object' || schema === null) {
      return schema;
    }

    const xMsEnum = schema['x-ms-enum'];
    if (typeof xMsEnum !== 'object' || xMsEnum === null) {
      return schema;
    }

    const { values } = xMsEnum;
    if (!Array.isArray(values)) {
      return schema;
    }

    return {
      ...schema,
      'x-ms-enum': {
        ...xMsEnum,
        values: values.map((enumValue) => {
          const name = enumValue && enumValue.name;
          return {
            ...enumValue,
            name: typeof name === 'string' ? name.toUpperCase() : name,
          };
        }),
      },
    };
  }

  transformSchemas(schemas) {
    if (typeof schemas !== 'object' || schemas === null) {
      return schemas;
    }

    return {
      ...schemas,
      CurrencyCode: this.transformSchema(schemas.CurrencyCode),
    };
  }

  transformComponents(components) {
    if (typeof components !== 'object' || components === null) {
      return components;
    }

    return {
      ...components,
      schemas: this.transformSchemas(components.schemas),
    };
  }

  transformOpenApi(openApi) {
    if (typeof openApi !== 'object' || openApi === null) {
      return openApi;
    }

    return {
      ...openApi,
      components: this.transformComponents(openApi.components),
      definitions: this.transformSchemas(openApi.definitions),
    };
  }
}
