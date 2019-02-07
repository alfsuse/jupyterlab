/**
 * Support for exporting datasets as code snippets.
 */

import { createViewerMimeType, View } from './viewers';
import { singleConverter, Converter } from './converters';
import { extractFileMimeType } from './files';
const baseMimeType = 'application/x.jupyter.snippet; label=';

export function snippetMimeType(label: string) {
  return `${baseMimeType}${label}`;
}

export function extractSnippetLabel(mimeType: string): string | null {
  if (!mimeType.startsWith(baseMimeType)) {
    return null;
  }
  return mimeType.slice(baseMimeType.length);
}

export interface IFileSnippetConverterOptions {
  mimeType: string;
  createSnippet: (path: string) => string;
  label: string;
}
export function fileSnippetConverter({
  mimeType,
  createSnippet,
  label
}: IFileSnippetConverterOptions): Converter<string, string> {
  return singleConverter((someMimeType: string) => {
    const innerMimeType = extractFileMimeType(someMimeType);
    if (innerMimeType !== mimeType) {
      return null;
    }
    return [
      snippetMimeType(label),
      async (path: string) => createSnippet(path)
    ];
  });
}
export function snippetViewerConverter(
  insert: (snippet: string) => Promise<void>
): Converter<string, View> {
  return singleConverter((mimeType: string) => {
    const label = extractSnippetLabel(mimeType);
    if (label === null) {
      return null;
    }
    return [
      createViewerMimeType(label),
      async data => async () => insert(data)
    ];
  });
}