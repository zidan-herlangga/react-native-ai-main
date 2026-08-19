/**
 * Kalkulator - eksekusi ekspresi matematika secara lokal.
 * Mendukung operasi dasar: +, -, *, /, ^, %, sqrt, abs, sin, cos, tan, log, dll.
 * 100% gratis, tidak perlu API.
 */

// Tokenizer sederhana untuk ekspresi matematika
type Token =
  | { type: "number"; value: number }
  | { type: "op"; value: string }
  | { type: "paren"; value: "(" | ")" }
  | { type: "func"; value: string };

const FUNC_MAP: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt,
  abs: Math.abs,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  log: Math.log10,
  ln: Math.log,
  exp: Math.exp,
  ceil: Math.ceil,
  floor: Math.floor,
  round: Math.round,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
};

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = expr.replace(/\s+/g, "");

  while (i < s.length) {
    const ch = s[i];

    // Number (including decimals)
    if (/[0-9.]/.test(ch)) {
      let num = "";
      while (i < s.length && /[0-9.eE+-]/.test(s[i])) {
        // Allow scientific notation like 1e10
        if ((s[i] === "e" || s[i] === "E") && i + 1 < s.length && /[+-]/.test(s[i + 1])) {
          num += s[i] + s[i + 1];
          i += 2;
          continue;
        }
        num += s[i];
        i++;
      }
      tokens.push({ type: "number", value: parseFloat(num) });
      continue;
    }

    // Function name
    if (/[a-zA-Z]/.test(ch)) {
      let name = "";
      while (i < s.length && /[a-zA-Z]/.test(s[i])) {
        name += s[i];
        i++;
      }
      tokens.push({ type: "func", value: name.toLowerCase() });
      continue;
    }

    // Operators and parens
    if ("+-*/^%()".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }

    // Unknown character — skip
    i++;
  }
  return tokens;
}

// Recursive descent parser
class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(): Token {
    return this.tokens[this.pos++];
  }

  // expression = term (('+' | '-') term)*
  parse(): number {
    let left = this.term();
    while (this.peek()?.type === "op" && (this.peek()!.value === "+" || this.peek()!.value === "-")) {
      const op = this.consume().value;
      const right = this.term();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  // term = unary (('*' | '/' | '%') unary)*
  private term(): number {
    let left = this.unary();
    while (this.peek()?.type === "op" && ("*/%".includes((this.peek() as { type: string; value: string }).value))) {
      const op = this.consume().value;
      const right = this.unary();
      if (op === "*") left *= right;
      else if (op === "/") left /= right;
      else left %= right;
    }
    return left;
  }

  // unary = ('-' | '+') unary | power
  private unary(): number {
    if (this.peek()?.type === "op" && (this.peek()!.value === "-" || this.peek()!.value === "+")) {
      const op = this.consume().value;
      return op === "-" ? -this.unary() : this.unary();
    }
    return this.power();
  }

  // power = primary ('^' unary)?
  private power(): number {
    let left = this.primary();
    if (this.peek()?.type === "op" && this.peek()!.value === "^") {
      this.consume();
      const right = this.unary();
      left = Math.pow(left, right);
    }
    return left;
  }

  // primary = number | func '(' expression ')' | '(' expression ')'
  private primary(): number {
    const token = this.peek();
    if (!token) throw new Error("Ekspresi tidak valid");

    // Number
    if (token.type === "number") {
      this.consume();
      return token.value;
    }

    // Function call
    if (token.type === "func") {
      const funcName = token.value;
      this.consume();
      if (this.peek()?.type === "op" && this.peek()!.value === "(") {
        this.consume(); // eat '('
        const arg = this.parse();
        if (this.peek()?.type === "op" && this.peek()!.value === ")") {
          this.consume(); // eat ')'
        }
        const fn = FUNC_MAP[funcName];
        if (!fn) throw new Error(`Fungsi '${funcName}' tidak dikenal`);
        return fn(arg);
      }
      throw new Error(`Fungsi '${funcName}' membutuhkan argumen dalam kurung`);
    }

    // Parenthesized expression
    if (token.type === "op" && token.value === "(") {
      this.consume();
      const result = this.parse();
      if (this.peek()?.type === "op" && this.peek()!.value === ")") {
        this.consume();
      }
      return result;
    }

    throw new Error(`Token tidak valid: ${JSON.stringify(token)}`);
  }
}

// Konstanta umum
const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  phi: (1 + Math.sqrt(5)) / 2,
};

/**
 * Hitung ekspresi matematika.
 * Mengembalikan string hasil atau pesan error.
 */
export function calculate(expression: string): string {
  try {
    // Replace konstanta
    let expr = expression.trim();
    for (const [name, val] of Object.entries(CONSTANTS)) {
      expr = expr.replace(new RegExp(`\\b${name}\\b`, "gi"), String(val));
    }

    // Replace operator umum
    expr = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/√/g, "sqrt");

    const tokens = tokenize(expr);
    if (tokens.length === 0) return "Error: Ekspresi kosong";

    const parser = new Parser(tokens);
    const result = parser.parse();

    if (!isFinite(result)) {
      if (isNaN(result)) return "Error: Hasil tidak terdefinisi (NaN)";
      return result > 0 ? "Infinity (∞)" : "-Infinity (-∞)";
    }

    // Format result — hapus trailing zeros yang tidak perlu
    const formatted = Number.isInteger(result) ? result.toString() : parseFloat(result.toPrecision(12)).toString();
    return formatted;
  } catch (err) {
    return `Error: ${err instanceof Error ? err.message : "Ekspresi tidak valid"}`;
  }
}
