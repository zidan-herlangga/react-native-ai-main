import React, { type ReactNode } from "react";
import { Text, type TextStyle } from "react-native";

/* ─── Token types ─── */

type TokenType =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "function"
  | "operator"
  | "punctuation"
  | "plain";

interface Token {
  type: TokenType;
  value: string;
}

/* ─── Language keyword sets ─── */

const JS_KEYWORDS = new Set([
  "abstract",
  "arguments",
  "async",
  "await",
  "boolean",
  "break",
  "byte",
  "case",
  "catch",
  "char",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "double",
  "else",
  "enum",
  "eval",
  "export",
  "extends",
  "false",
  "final",
  "finally",
  "float",
  "for",
  "from",
  "function",
  "goto",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "int",
  "interface",
  "let",
  "long",
  "native",
  "new",
  "null",
  "of",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "short",
  "static",
  "super",
  "switch",
  "synchronized",
  "this",
  "throw",
  "throws",
  "transient",
  "true",
  "try",
  "typeof",
  "undefined",
  "var",
  "void",
  "volatile",
  "while",
  "with",
  "yield",
]);

const PY_KEYWORDS = new Set([
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "False",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "None",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "True",
  "try",
  "while",
  "with",
  "yield",
]);

const GO_KEYWORDS = new Set([
  "break",
  "case",
  "chan",
  "const",
  "continue",
  "default",
  "defer",
  "else",
  "fallthrough",
  "for",
  "func",
  "go",
  "goto",
  "if",
  "import",
  "interface",
  "map",
  "package",
  "range",
  "return",
  "select",
  "struct",
  "switch",
  "type",
  "var",
]);

const RUST_KEYWORDS = new Set([
  "as",
  "async",
  "await",
  "break",
  "const",
  "continue",
  "crate",
  "dyn",
  "else",
  "enum",
  "extern",
  "false",
  "fn",
  "for",
  "if",
  "impl",
  "in",
  "let",
  "loop",
  "match",
  "mod",
  "move",
  "mut",
  "pub",
  "ref",
  "return",
  "self",
  "Self",
  "static",
  "struct",
  "super",
  "trait",
  "true",
  "type",
  "unsafe",
  "use",
  "where",
  "while",
]);

const LANG_KEYWORDS: Record<string, Set<string>> = {
  javascript: JS_KEYWORDS,
  js: JS_KEYWORDS,
  jsx: JS_KEYWORDS,
  typescript: JS_KEYWORDS,
  ts: JS_KEYWORDS,
  tsx: JS_KEYWORDS,
  python: PY_KEYWORDS,
  py: PY_KEYWORDS,
  go: GO_KEYWORDS,
  golang: GO_KEYWORDS,
  rust: RUST_KEYWORDS,
  rs: RUST_KEYWORDS,
  java: JS_KEYWORDS,
  kotlin: JS_KEYWORDS,
  swift: JS_KEYWORDS,
  c: JS_KEYWORDS,
  cpp: JS_KEYWORDS,
  csharp: JS_KEYWORDS,
  ruby: JS_KEYWORDS,
  php: JS_KEYWORDS,
  bash: JS_KEYWORDS,
  sh: JS_KEYWORDS,
  shell: JS_KEYWORDS,
  sql: JS_KEYWORDS,
};

/* ─── Simple tokenizer ─── */

const TOKEN_RE =
  /\/\/.*|\/\*[\s\S]*?\*\/|#.*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[\s\S]*?`|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b|\b\w+(?=\s*\()/g;

function tokenize(code: string, language?: string): Token[] {
  const keywords = LANG_KEYWORDS[language?.toLowerCase() ?? ""] ?? JS_KEYWORDS;
  const tokens: Token[] = [];
  let lastIndex = 0;

  const re = new RegExp(TOKEN_RE.source, "g");
  let m: RegExpExecArray | null;

  while ((m = re.exec(code)) !== null) {
    if (m.index > lastIndex) {
      tokens.push({ type: "plain", value: code.slice(lastIndex, m.index) });
    }

    const raw = m[0];
    if (raw.startsWith("//") || raw.startsWith("/*") || raw.startsWith("#")) {
      tokens.push({ type: "comment", value: raw });
    } else if (
      raw.startsWith('"') ||
      raw.startsWith("'") ||
      raw.startsWith("`")
    ) {
      tokens.push({ type: "string", value: raw });
    } else if (/^\d/.test(raw)) {
      tokens.push({ type: "number", value: raw });
    } else if (raw.endsWith("(") && keywords.has(raw.slice(0, -1))) {
      tokens.push({ type: "keyword", value: raw });
    } else if (raw.endsWith("(")) {
      tokens.push({ type: "function", value: raw });
    } else if (keywords.has(raw)) {
      tokens.push({ type: "keyword", value: raw });
    } else {
      tokens.push({ type: "plain", value: raw });
    }

    lastIndex = re.lastIndex;
  }

  if (lastIndex < code.length) {
    tokens.push({ type: "plain", value: code.slice(lastIndex) });
  }

  return tokens;
}

/* ─── Theme colors ─── */

export interface HighlightColors {
  keyword: string;
  string: string;
  comment: string;
  number: string;
  function: string;
  operator: string;
  punctuation: string;
  plain: string;
}

export const DARK_COLORS: HighlightColors = {
  keyword: "#C792EA",
  string: "#C3E88D",
  comment: "#676E95",
  number: "#F78C6C",
  function: "#82AAFF",
  operator: "#89DDFF",
  punctuation: "#89DDFF",
  plain: "#D6DEEB",
};

export const LIGHT_COLORS: HighlightColors = {
  keyword: "#D73A49",
  string: "#032F62",
  comment: "#6A737D",
  number: "#005CC5",
  function: "#6F42C1",
  operator: "#D73A49",
  punctuation: "#24292E",
  plain: "#24292E",
};

/* ─── Public API ─── */

export function highlightCode(
  code: string,
  language: string | undefined,
  colors: HighlightColors,
  baseStyle: TextStyle,
): ReactNode[] {
  const tokens = tokenize(code, language);
  return tokens.map((tok, i) => {
    const color = tok.type === "plain" ? colors.plain : colors[tok.type];
    return (
      <Text key={`tk${i}`} style={[baseStyle, { color }]}>
        {tok.value}
      </Text>
    );
  });
}

/* ─── Line-number aware highlight ─── */

export type HighlightedLine = {
  line: number;
  tokens: { color: string; value: string }[];
};

export function highlightCodeLines(
  code: string,
  language: string | undefined,
  colors: HighlightColors,
): HighlightedLine[] {
  const rawTokens = tokenize(code, language);
  const lines: HighlightedLine[] = [];
  let currentLine = 1;
  let lineTokens: { color: string; value: string }[] = [];

  for (const tok of rawTokens) {
    const parts = tok.value.split("\n");
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        lines.push({ line: currentLine, tokens: lineTokens });
        currentLine++;
        lineTokens = [];
      }
      if (parts[i].length > 0) {
        const color =
          tok.type === "plain" ? colors.plain : colors[tok.type];
        lineTokens.push({ color, value: parts[i] });
      }
    }
  }

  // push last line if not empty or if there's content
  if (lineTokens.length > 0 || lines.length === 0) {
    lines.push({ line: currentLine, tokens: lineTokens });
  }

  return lines;
}
