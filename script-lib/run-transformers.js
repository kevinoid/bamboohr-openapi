/**
 * @copyright Copyright 2016-2024 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import { readFile, writeFile } from 'node:fs/promises';

import deepmerge from 'deepmerge';
import { load as loadYaml } from 'js-yaml';
import jsonReplaceExponentials from 'json-replace-exponentials';

import Autorest2Transformer from './autorest2-transformer.js';
import Autorest3Transformer from './autorest3-transformer.js';
import OpenApiTransformer from './openapi-transformer.js';
import SwaggerTransformer from './swagger-transformer.js';

// Only merge plain objects which are non-empty.
// Note: Merging empty objects would have no effect.  Instead, overwrite.
function isMergeableObject(value) {
  return typeof value === 'object'
    && value !== null
    && Object.prototype.toString.call(value) === '[object Object]'
    && Object.keys(value).length > 0;
}

async function transform(openApi, Transformer, output) {
  const transformer = new Transformer();
  const transformed = await transformer.transformOpenApi(openApi);
  const json =
    jsonReplaceExponentials(JSON.stringify(transformed, undefined, 2));
  await writeFile(output, json);
}

/** Options for command entry points.
 *
 * @typedef {{
 *   env: !Object<string,string>,
 *   stdin: !module:stream.Readable,
 *   stdout: !module:stream.Writable,
 *   stderr: !module:stream.Writable
 * }} CommandOptions
 * @property {!Object<string,string>} env Environment variables.
 * @property {!module:stream.Readable} stdin Stream from which input is read.
 * @property {!module:stream.Writable} stdout Stream to which output is
 * written.
 * @property {!module:stream.Writable} stderr Stream to which errors and
 * non-output status messages are written.
 */
// const CommandOptions;

/** Entry point for this command.
 *
 * @param {!Array<string>} args Command-line arguments.
 * @param {!CommandOptions} options Options.
 * @returns {!Promise<number>} Promise for exit code.  Only rejected for
 * arguments with invalid type (or args.length < 2).
 */
export default async function runTransformersMain(args, options) {
  if (!Array.isArray(args) || args.length < 2) {
    throw new TypeError('args must be an Array with at least 2 items');
  }

  if (!options || typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  if (!options.stdin || typeof options.stdin.on !== 'function') {
    throw new TypeError('options.stdin must be a stream.Readable');
  }
  if (!options.stdout || typeof options.stdout.write !== 'function') {
    throw new TypeError('options.stdout must be a stream.Writable');
  }
  if (!options.stderr || typeof options.stderr.write !== 'function') {
    throw new TypeError('options.stderr must be a stream.Writable');
  }

  if (args.length < 3) {
    options.stderr.write('Error: At least one argument is required.\n'
      + `Usage: ${args[1]} <OpenAPI Document...>\n`);
    return 1;
  }

  function onWarning(errYaml) {
    options.stderr.write(`${errYaml}\n`);
  }

  async function readYaml(filename) {
    const yaml = await readFile(filename, { encoding: 'utf8' });
    return loadYaml(yaml, {
      filename,
      onWarning,
      json: true, // don't throw on duplicate keys
    });
  }

  try {
    const openApis = await Promise.all(args.slice(2).map(readYaml));
    const openApi = openApis.length === 1 ? openApis[0]
      : deepmerge.all(openApis, { clone: false, isMergeableObject });

    const results = await Promise.allSettled([
      transform(openApi, Autorest2Transformer, 'autorest2.json'),
      transform(openApi, Autorest3Transformer, 'autorest3.json'),
      transform(openApi, OpenApiTransformer, 'openapi.json'),
      transform(openApi, SwaggerTransformer, 'swagger.json'),
    ]);

    let exitCode = 0;
    for (const result of results) {
      if (result.status === 'rejected') {
        options.stderr.write(`${result.reason.stack}\n`);
        exitCode = 1;
      }
    }

    return exitCode;
  } catch (err) {
    options.stderr.write(`${err.stack}\n`);
    return 1;
  }
}
