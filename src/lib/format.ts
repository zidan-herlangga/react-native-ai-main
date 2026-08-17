/**
 * Strip markdown syntax for clean copy/share output.
 */
export function stripMarkdown(md: string): string {
  if (!md) return '';
  let text = md;

  // code blocks: ``` ... ```
  text = text.replace(/```[\s\S]*?```/g, (m) => {
    const inner = m.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
    return inner;
  });

  // inline code: `...`
  text = text.replace(/`([^`]+)`/g, '$1');

  // images: ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // links: [text](url)
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // headings: ### text
  text = text.replace(/^#{1,6}\s+/gm, '');

  // bold+italic: ***text*** or ___text___
  text = text.replace(/\*{3}(.+?)\*{3}/g, '$1');
  text = text.replace(/_{3}(.+?)_{3}/g, '$1');

  // bold: **text** or __text__
  text = text.replace(/\*{2}(.+?)\*{2}/g, '$1');
  text = text.replace(/_{2}(.+?)_{2}/g, '$1');

  // italic: *text* or _text_
  text = text.replace(/\*(.+?)\*/g, '$1');
  text = text.replace(/_(.+?)_/g, '$1');

  // strikethrough: ~~text~~
  text = text.replace(/~~(.+?)~~/g, '$1');

  // blockquote: > text
  text = text.replace(/^>\s+/gm, '');

  // horizontal rule: --- or *** or ___
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');

  // unordered list: - or * or +
  text = text.replace(/^[\-\*\+]\s+/gm, '');

  // ordered list: 1. or 1)
  text = text.replace(/^\d+[\.\)]\s+/gm, '');

  // tables: | cell | cell |
  text = text.replace(/^\|/gm, '').replace(/\|/g, ' ');

  // clean up extra blank lines
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}
