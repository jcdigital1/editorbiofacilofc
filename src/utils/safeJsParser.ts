import { ConfigModelInfo } from '../types';

/**
 * Safely parses JavaScript object literals (e.g. const CONFIG = { ... } or CONFIGURACAO = { ... })
 * WITHOUT using eval() or new Function().
 */
export function extractConfigFromHtml(html: string): ConfigModelInfo | null {
  // Regex to look for CONFIG or CONFIGURACAO assignments
  const pattern = /(?:(?:const|let|var)\s+|window\.)?(CONFIG|CONFIGURACAO)\s*=\s*(\{[\s\S]*?\n\s*\});?/m;
  const match = html.match(pattern);

  if (!match) {
    return null;
  }

  const variableName = match[1] as 'CONFIG' | 'CONFIGURACAO';
  const rawJsSnippet = match[0];
  const objectLiteralStr = match[2];

  try {
    const parsedData = parseJsObjectLiteral(objectLiteralStr);
    return {
      variableName,
      data: parsedData,
      scriptTagIndex: match.index || 0,
      rawJsSnippet,
    };
  } catch (err) {
    console.warn('Failed to parse CONFIG object with safe parser:', err);
    return null;
  }
}

/**
 * Safe parser for JS object literal to JSON without eval
 */
export function parseJsObjectLiteral(str: string): Record<string, any> {
  // 1. Remove line comments (// ...) and block comments (/* ... */)
  let cleaned = str.replace(/\/\*[\s\S]*?\*\//g, '');
  cleaned = cleaned.replace(/\/\/[^\n]*/g, '');

  // 2. Normalize whitespace
  cleaned = cleaned.trim();

  // 3. Convert JS object literal string to valid JSON string:
  // We need to carefully handle strings so we don't accidentally alter contents inside strings.
  const tokens: string[] = [];
  let inString = false;
  let quoteChar = '';
  let escape = false;
  let currentString = '';
  let nonStringAccumulator = '';

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (inString) {
      if (escape) {
        currentString += char;
        escape = false;
      } else if (char === '\\') {
        currentString += char;
        escape = true;
      } else if (char === quoteChar) {
        // End of string
        inString = false;
        // Escape any raw newlines or double quotes if quoteChar was single quote
        const escapedContent = currentString.replace(/"/g, '\\"');
        tokens.push(`"${escapedContent}"`);
        currentString = '';
      } else {
        currentString += char;
      }
    } else {
      if (char === '"' || char === "'" || char === '`') {
        // flush non-string accumulator processed
        if (nonStringAccumulator) {
          tokens.push(processNonStringFragment(nonStringAccumulator));
          nonStringAccumulator = '';
        }
        inString = true;
        quoteChar = char;
        currentString = '';
      } else {
        nonStringAccumulator += char;
      }
    }
  }

  if (nonStringAccumulator) {
    tokens.push(processNonStringFragment(nonStringAccumulator));
  }

  const jsonCandidate = tokens.join('');

  // Clean trailing commas before '}' or ']'
  const sanitizedJson = jsonCandidate
    .replace(/,\s*([}\]])/g, '$1')
    .trim();

  return JSON.parse(sanitizedJson);
}

function processNonStringFragment(fragment: string): string {
  // Quote unquoted object keys: e.g. `{ nome: "..." }` or `, preco: "..."`
  let res = fragment.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
  // Handle start of object key: `^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:`
  res = res.replace(/^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/, '"$1":');
  return res;
}

/**
 * Serializes a JavaScript object into a clean JS literal representation
 */
export function serializeConfigToJs(variableName: string, data: Record<string, any>): string {
  const json = JSON.stringify(data, null, 2);
  return `const ${variableName} = ${json};`;
}

/**
 * Replaces or updates the CONFIG / CONFIGURACAO in the HTML string with new data
 */
export function updateConfigInHtml(html: string, config: ConfigModelInfo, newData: Record<string, any>): string {
  const pattern = new RegExp(
    `(?:(?:const|let|var)\\s+|window\\.)?(${config.variableName})\\s*=\\s*\\{[\\s\\S]*?\\n\\s*\\};?`,
    'm'
  );

  const newSnippet = serializeConfigToJs(config.variableName, newData);
  return html.replace(pattern, newSnippet);
}
