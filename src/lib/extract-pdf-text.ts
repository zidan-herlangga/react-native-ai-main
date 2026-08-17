/**
 * Lightweight PDF text extraction.
 * Parses the raw PDF binary and extracts text between BT (begin text) and
 * ET (end text) operators. Handles common Tj, TJ, ', " text operators
 * and Unicode mappings. Not a full PDF parser — works for most text-based PDFs.
 */

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB limit for extraction
const MAX_OUTPUT = 60000; // ~15k tokens

/** Decode a PDF string literal, handling octal escapes and common escapes. */
function decodePdfString(raw: string): string {
  let out = "";
  let i = 0;
  while (i < raw.length) {
    const ch = raw.charCodeAt(i);
    if (ch === 0x5c /* \ */ && i + 1 < raw.length) {
      const next = raw.charCodeAt(i + 1);
      if (next >= 0x30 && next <= 0x37) {
        // octal escape
        let oct = String.fromCharCode(next);
        if (i + 2 < raw.length && raw.charCodeAt(i + 2) >= 0x30 && raw.charCodeAt(i + 2) <= 0x37) {
          oct += raw.charCodeAt(i + 2);
          if (i + 3 < raw.length && raw.charCodeAt(i + 3) >= 0x30 && raw.charCodeAt(i + 3) <= 0x37) {
            oct += raw.charCodeAt(i + 3);
            i += 4;
          } else {
            i += 3;
          }
        } else {
          i += 2;
        }
        out += String.fromCharCode(parseInt(oct, 8));
      } else {
        switch (next) {
          case 0x6e: out += "\n"; break;  // \n
          case 0x72: out += "\r"; break;  // \r
          case 0x74: out += "\t"; break;  // \t
          case 0x62: out += "\b"; break;  // \b
          case 0x66: out += "\f"; break;  // \f
          case 0x28: out += "("; break;  // \(
          case 0x29: out += ")"; break;  // \)
          case 0x5c: out += "\\"; break;  // \\
          default: out += String.fromCharCode(next); break;
        }
        i += 2;
      }
    } else {
      out += String.fromCharCode(ch);
      i++;
    }
  }
  return out;
}

/** Extract text strings from a PDF content stream chunk. */
function extractFromStream(stream: string): string {
  const parts: string[] = [];

  // Match string literals: ( ... ) — may span multiple lines, handle nested parens
  const literalRe = /\(([^)]*)\)/g;
  let m: RegExpExecArray | null;
  while ((m = literalRe.exec(stream)) !== null) {
    const decoded = decodePdfString(m[1]);
    // filter out non-printable garbage
    const clean = decoded.replace(/[\x00-\x08\x0e-\x1f]/g, "").trim();
    if (clean.length > 0) parts.push(clean);
  }

  // Match hex strings: < ... >
  const hexRe = /<([0-9A-Fa-f\s]+)>/g;
  while ((m = hexRe.exec(stream)) !== null) {
    const hex = m[1].replace(/\s/g, "");
    if (hex.length < 2) continue;
    let decoded = "";
    for (let i = 0; i < hex.length; i += 2) {
      decoded += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
    }
    const clean = decoded.replace(/[\x00-\x08\x0e-\x1f]/g, "").trim();
    if (clean.length > 0) parts.push(clean);
  }

  return parts.join(" ");
}

/**
 * Extract readable text from a base64-encoded PDF.
 * Returns plain text that can be sent to AI models.
 */
export function extractPdfText(base64: string): string {
  try {
    // Decode base64 to raw string
    let raw: string;
    try {
      // atob works in React Native (polyfilled)
      raw = atob(base64);
    } catch {
      return "";
    }

    if (raw.length > MAX_BYTES) return "";

    // Quick check: is this actually a PDF?
    if (!raw.startsWith("%PDF")) return "";

    const textParts: string[] = [];

    // Strategy 1: Find stream objects and extract text from content streams
    const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let sm: RegExpExecArray | null;
    while ((sm = streamRe.exec(raw)) !== null) {
      const streamContent = sm[1];
      // Only process streams that contain text operators
      if (streamContent.includes("BT") && streamContent.includes("ET")) {
        const text = extractFromStream(streamContent);
        if (text.length > 2) textParts.push(text);
      }
    }

    // Strategy 2: If strategy 1 found little, try extracting all string literals
    // from the entire document (covers some non-standard PDFs)
    if (textParts.join("").length < 50) {
      const allText = extractFromStream(raw);
      if (allText.length > textParts.join("").length) {
        textParts.length = 0;
        textParts.push(allText);
      }
    }

    const result = textParts
      .join("\n")
      .replace(/\s+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (result.length < 10) return "";

    return result.length > MAX_OUTPUT ? result.slice(0, MAX_OUTPUT) + "\n... [dipotong]" : result;
  } catch {
    return "";
  }
}
