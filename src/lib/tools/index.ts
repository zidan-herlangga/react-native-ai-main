/**
 * Tools index — ekspor semua tool definitions dan executors.
 */

import { calculate } from "./calculator";
import { executeCode } from "./code-executor";
import { convertUnit } from "./unit-converter";
import { fetchUrl } from "./url-fetcher";

export { calculate } from "./calculator";
export { executeCode, type CodeResult } from "./code-executor";
export { convertUnit } from "./unit-converter";
export { fetchUrl, type FetchResult } from "./url-fetcher";

// ─── Tool Definitions (OpenAI function calling format) ─────────────────────

export const CALCULATOR_TOOL = {
  type: "function" as const,
  function: {
    name: "calculator",
    description:
      "Hitung ekspresi matematika. Mendukung operasi dasar (+, -, *, /, ^, %), fungsi matematika (sqrt, sin, cos, tan, log, ln, abs, ceil, floor, round), dan konstanta (pi, e). Contoh: '2 + 3 * 4', 'sqrt(144)', 'sin(pi/2)'.",
    parameters: {
      type: "object" as const,
      properties: {
        expression: {
          type: "string" as const,
          description:
            "Ekspresi matematika yang akan dihitung. Contoh: '2 + 3 * 4', 'sqrt(144)', '(5 + 3) ^ 2'",
        },
      },
      required: ["expression"],
    },
  },
};

export const CODE_EXECUTOR_TOOL = {
  type: "function" as const,
  function: {
    name: "execute_code",
    description:
      "Jalankan kode pemrograman. Mendukung Python, JavaScript, Go, Rust, C, Java, Ruby, PHP, Swift, Kotlin, TypeScript, dan banyak lagi. Kode dijalankan di sandbox Piston yang aman.",
    parameters: {
      type: "object" as const,
      properties: {
        language: {
          type: "string" as const,
          description:
            "Bahasa pemrograman. Contoh: 'python', 'javascript', 'go', 'rust', 'c', 'java'",
        },
        code: {
          type: "string" as const,
          description:
            "Kode yang akan dijalankan. Gunakan print/output untuk menampilkan hasil.",
        },
      },
      required: ["language", "code"],
    },
  },
};

export const UNIT_CONVERTER_TOOL = {
  type: "function" as const,
  function: {
    name: "convert_unit",
    description:
      "Konversi satuan. Mendukung: panjang (km, m, mile, foot, inch, yard), berat (kg, g, lbs, oz, ton), suhu (celsius, fahrenheit, kelvin), kecepatan (km/h, m/s, mph, knot), luas (m², ft², hektar, acre), volume (L, mL, galon, cup), waktu (jam, menit, detik, hari, minggu, bulan, tahun), data (B, KB, MB, GB, TB).",
    parameters: {
      type: "object" as const,
      properties: {
        value: {
          type: "number" as const,
          description: "Nilai yang akan dikonversi. Contoh: 100",
        },
        from: {
          type: "string" as const,
          description:
            "Satuan asal. Contoh: 'km', 'kg', 'celsius', 'mph', 'galon'",
        },
        to: {
          type: "string" as const,
          description:
            "Satuan tujuan. Contoh: 'mile', 'lbs', 'fahrenheit', 'km/h', 'liter'",
        },
      },
      required: ["value", "from", "to"],
    },
  },
};

export const URL_FETCHER_TOOL = {
  type: "function" as const,
  function: {
    name: "fetch_url",
    description:
      "Ambil dan baca konten dari halaman web. Gunakan tool ini saat user memberikan URL/link dan ingin Anda membaca, merangkum, atau menganalisis isi halaman tersebut. Mendukung artikel, dokumentasi, blog, berita, dll.",
    parameters: {
      type: "object" as const,
      properties: {
        url: {
          type: "string" as const,
          description:
            "URL halaman web yang akan diambil. Contoh: 'https://example.com/artikel'",
        },
      },
      required: ["url"],
    },
  },
};

// Semua tool definitions
export const ALL_TOOLS = [
  CALCULATOR_TOOL,
  CODE_EXECUTOR_TOOL,
  UNIT_CONVERTER_TOOL,
  URL_FETCHER_TOOL,
];

// ─── Tool Executors ────────────────────────────────────────────────────────

export type ToolResult = {
  toolCallId: string;
  name: string;
  result: string;
};

/**
 * Eksekusi tool berdasarkan nama dan argumen.
 * Mengembalikan hasil sebagai string untuk dikirim kembali ke model.
 */
export async function executeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  switch (name) {
    case "calculator": {
      const expr = typeof args.expression === "string" ? args.expression : "";
      return calculate(expr);
    }
    case "execute_code": {
      const lang = typeof args.language === "string" ? args.language : "";
      const code = typeof args.code === "string" ? args.code : "";
      if (!code) return "Error: Kode kosong.";
      if (!lang) return "Error: Bahasa pemrograman tidak ditentukan.";
      const result = await executeCode(code, lang);
      let output = "";
      if (result.output) output += result.output;
      if (result.error) output += (output ? "\n\n" : "") + `Error:\n${result.error}`;
      return output || "(tidak ada output)";
    }
    case "convert_unit": {
      const value = typeof args.value === "number" ? args.value : parseFloat(String(args.value));
      const from = typeof args.from === "string" ? args.from : "";
      const to = typeof args.to === "string" ? args.to : "";
      return convertUnit(value, from, to);
    }
    case "fetch_url": {
      const url = typeof args.url === "string" ? args.url : "";
      if (!url) return "Error: URL tidak ditentukan.";
      const result = await fetchUrl(url);
      if (!result.success) return `Error: ${result.error}`;
      let output = "";
      if (result.title) output += `Judul: ${result.title}\n\n`;
      output += result.content;
      return output;
    }
    default:
      return `Error: Tool '${name}' tidak dikenal.`;
  }
}
