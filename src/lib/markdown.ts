// lib/markdown.ts

const CODE_FENCE = /```[\s\S]*?```|`[^`\n]+`/g;
const ZWSP = "\u200B";

// Karakter pemisah agar kata/URL panjang bisa wrap dengan rapi di layar sempit.
const BREAK_AFTER = /[\/\\_.\-?&=#:~+%,;@()\[\]{}<>|'"!]/g;
const LONG_UNBROKEN_RUN = /\S{20,}/g;
const URL_PATTERN = /https?:\/\/[^\s<>"']+|www\.[^\s<>"']+/g;

export function softBreak(text: string): string {
  let result = text;

  // 1. Handle URL
  result = result.replace(URL_PATTERN, (url) => {
    return url
      .replace(/\//g, `/${ZWSP}`)
      .replace(/\./g, `.${ZWSP}`)
      .replace(/\?/g, `?${ZWSP}`)
      .replace(/&/g, `&${ZWSP}`)
      .replace(/=/g, `=${ZWSP}`)
      .replace(/#/g, `#${ZWSP}`);
  });

  // 2. Handle teks panjang tanpa spasi
  result = result.replace(LONG_UNBROKEN_RUN, (run) => {
    if (/^[a-zA-Z0-9+/=]{20,}$/.test(run)) {
      return run
        .replace(/(.{12})/g, `$1${ZWSP}`)
        .replace(new RegExp(`${ZWSP}$`), "");
    }

    const broken = run.replace(BREAK_AFTER, (char) => `${char}${ZWSP}`);
    return broken
      .split(ZWSP)
      .map((segment) => {
        if (segment.length > 15) {
          return segment.replace(/(.{12})/g, `$1${ZWSP}`);
        }
        return segment;
      })
      .join(ZWSP);
  });

  // 3. Handle underscore dan dash panjang
  result = result.replace(/_{10,}/g, (match) => {
    return match.replace(/_/g, `_${ZWSP}`);
  });
  result = result.replace(/-{10,}/g, (match) => {
    return match.replace(/-/g, `-${ZWSP}`);
  });

  return result;
}

const ESCAPED = String.raw`[\`*_{}[\]()#+!>.-]`;

export function unescapeMarkdown(source: string): string {
  return source.replace(new RegExp(`\\\\(${ESCAPED})`, "g"), "$1");
}

// Lindungi blok kode saat membersihkan teks, lalu kembalikan setelahnya.
function protectCode(source: string): {
  text: string;
  restore: (text: string) => string;
} {
  const blocks: string[] = [];
  const text = source.replace(CODE_FENCE, (match) => {
    blocks.push(match);
    return `\uE000${blocks.length - 1}\uE001`;
  });
  return {
    text,
    restore: (value) =>
      value.replace(
        /\uE000(\d+)\uE001/g,
        (_, index) => blocks[Number(index)] ?? "",
      ),
  };
}

// Bersihkan output model sebelum dirender: buang komentar HTML, tag HTML,
// gambar kosong, baris heading/blockquote kosong, dan spasi berlebih.
export function sanitizeMarkdown(md: string): string {
  const withoutEmptyFences = md.replace(
    /^[ \t]{0,3}```[^\n]*\n\s*```[ \t]*$/gm,
    "",
  );
  const { text, restore } = protectCode(withoutEmptyFences);
  const cleaned = text
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?[a-zA-Z][^>]*>/g, "")
    .replace(/^\s{0,3}<!--/gm, "")
    .replace(/!\[[^\]]*\]\(\s*\)/g, "")
    .replace(/^[ \t]*>[ \t]*$/gm, "")
    .replace(/^[ \t]{0,3}#{1,6}[ \t]*$/gm, "")
    .replace(/[ \t]+(?=\n|$)/g, "")
    .replace(/\s+$/, "")
    .replace(/(?:\n[ \t]*(?:(?:[-*+]|\d+[.)])|(?:[-*_]\s*){3,})[ \t]*)+$/, "")
    .replace(/\s+$/, "");
  return restore(unescapeMarkdown(cleaned));
}

// Ubah markdown menjadi teks polos untuk ringkasan percakapan / preview.
export function markdownToPlainText(md: string): string {
  let text = unescapeMarkdown(md)
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`\n]+)`/g, "$1")
    .replace(/<\/?[a-zA-Z][^>]*>/g, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s*\|[\s:|:-]+\|\s*$/gm, "")
    .replace(/^\s*\|\s*/gm, "")
    .replace(/\s*\|\s*$/gm, "")
    .replace(/\s*\|\s*/g, ", ")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/^\s*\[[ xX]\]\s*/gm, "")
    .replace(/[~_*]{1,3}([^~_*\n]+?)[~_*]{1,3}/g, "$1")
    .replace(/[*_~`#]/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text;
}
