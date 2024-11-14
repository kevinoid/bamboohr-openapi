/**
 * @copyright Copyright 2019 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import microsoftCase
  from '@kevinoid/openapi-transformers/lib/microsoft-case.js';
import OpenApiTransformerBase from 'openapi-transformer-base';

function addCountryToCode(CountryCode, Country) {
  if (!CountryCode) {
    throw new Error('Missing CountryCode schema.');
  }

  if (!Country) {
    throw new Error('Missing Country schema.');
  }

  if (CountryCode.enum.length !== Country.enum.length) {
    throw new Error(
      `CountryCode count (${CountryCode.enum.length
      }) does not match Country count (${Country.enum.length})`,
    );
  }

  if (Object.hasOwn(CountryCode, 'x-enum-descriptions')) {
    throw new Error('CountryCode already has x-enum-descriptions');
  }

  if (Object.hasOwn(CountryCode, 'x-enum-varnames')) {
    throw new Error('CountryCode already has x-enum-varnames');
  }

  return {
    ...CountryCode,
    'x-enum-descriptions':
      Country.enum.map((country) => `ISO 3166-2 code for ${country}.`),
    'x-enum-varnames':
      Country.enum.map(microsoftCase),
  };
}

/**
 * Transformer to add x-enum-varnames and x-enum-descriptions to CountryCode
 * schema.
 */
export default class AddCountryCodeNamesTransformer
  extends OpenApiTransformerBase {
  // eslint-disable-next-line class-methods-use-this
  transformComponents(components) {
    return {
      ...components,
      schemas: {
        ...components.schemas,
        CountryCode: addCountryToCode(
          components.schemas.CountryCode,
          components.schemas.Country,
        ),
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
