/**
 * Code Executor - jalankan kode via Piston API (gratis, tanpa API key).
 * Mendukung Python, JavaScript, Go, Rust, C, Java, dll.
 * Endpoint: https://emkc.org/api/v2/piston/execute
 */

import { fetch } from "expo/fetch";

const PISTON_API = "https://emkc.org/api/v2/piston/execute";

const LANGUAGE_MAP: Record<string, string> = {
  javascript: "javascript",
  js: "javascript",
  node: "javascript",
  python: "python",
  py: "python",
  go: "go",
  golang: "go",
  rust: "rust",
  rs: "rust",
  c: "c",
  cpp: "cpp",
  "c++": "cpp",
  java: "java",
  ruby: "ruby",
  rb: "ruby",
  php: "php",
  swift: "swift",
  kotlin: "kotlin",
  ts: "typescript",
  typescript: "typescript",
  bash: "bash",
  sh: "bash",
  powershell: "powershell",
  lua: "lua",
  r: "r",
  dart: "dart",
  scala: "scala",
  elixir: "elixir",
  ex: "elixir",
  hs: "haskell",
  haskell: "haskell",
};

// Beberapa bahasa butuh filename agar piston tahu version yang tepat
const FILENAME_MAP: Record<string, string> = {
  javascript: "main.js",
  python: "main.py",
  go: "main.go",
  rust: "main.rs",
  c: "main.c",
  cpp: "main.cpp",
  java: "Main.java",
  ruby: "main.rb",
  php: "main.php",
  swift: "main.swift",
  kotlin: "main.kt",
  typescript: "main.ts",
  bash: "main.sh",
  lua: "main.lua",
  r: "main.R",
  dart: "main.dart",
  scala: "Main.scala",
  elixir: "main.exs",
  haskell: "main.hs",
};

export type CodeResult = {
  output: string;
  error: string | null;
  language: string;
  success: boolean;
};

/**
 * Jalankan kode via Piston API.
 * @param code - kode yang akan dijalankan
 * @param language - bahasa pemrograman (akan di-normalize)
 * @returns CodeResult dengan output/error
 */
export async function executeCode(
  code: string,
  language: string,
): Promise<CodeResult> {
  const lang = LANGUAGE_MAP[language.toLowerCase().trim()] || language.toLowerCase().trim();

  if (!lang) {
    return {
      output: "",
      error: "Bahasa pemrograman tidak dikenal. Gunakan: python, javascript, go, rust, c, java, dll.",
      language,
      success: false,
    };
  }

  // Batasi ukuran kode (max 10KB)
  if (code.length > 10240) {
    return {
      output: "",
      error: "Kode terlalu panjang (maks 10KB).",
      language: lang,
      success: false,
    };
  }

  const filename = FILENAME_MAP[lang] || `main.${lang}`;

  try {
    const response = await fetch(PISTON_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: lang,
        version: "*",
        files: [
          {
            name: filename,
            content: code,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 400) {
        return {
          output: "",
          error: `Bahasa '${lang}' tidak didukung oleh Piston. Coba: python, javascript, go, rust, c, java.`,
          language: lang,
          success: false,
        };
      }
      return {
        output: "",
        error: `Piston API error (HTTP ${response.status}). Coba lagi nanti.`,
        language: lang,
        success: false,
      };
    }

    const json = (await response.json()) as {
      run?: {
        stdout?: string;
        stderr?: string;
        code?: number;
        signal?: string | null;
      };
      compile?: {
        stderr?: string;
        code?: number;
      };
      message?: string;
    };

    if (json.message) {
      return {
        output: "",
        error: json.message,
        language: lang,
        success: false,
      };
    }

    const compileError = json.compile?.stderr?.trim();
    const runtimeOutput = json.run?.stdout?.trim() || "";
    const runtimeError = json.run?.stderr?.trim();
    const exitCode = json.run?.code;
    const signal = json.run?.signal;

    let output = runtimeOutput;
    let error: string | null = null;

    if (compileError) {
      error = `Compile error:\n${compileError}`;
      if (runtimeError) error += `\n\nRuntime error:\n${runtimeError}`;
    } else if (runtimeError) {
      error = runtimeError;
    }

    if (signal === "SIGKILL") {
      error = (error ? error + "\n\n" : "") + "Program dihentikan (timeout/limit memori).";
    }

    if (exitCode !== null && exitCode !== undefined && exitCode !== 0 && !error) {
      error = `Program exit dengan kode ${exitCode}`;
    }

    if (!output && !error) {
      output = "(tidak ada output)";
    }

    return {
      output,
      error,
      language: lang,
      success: !error,
    };
  } catch (err) {
    return {
      output: "",
      error: `Gagal terhubung ke Piston API: ${err instanceof Error ? err.message : "Unknown error"}`,
      language: lang,
      success: false,
    };
  }
}
