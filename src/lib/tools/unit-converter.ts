/**
 * Unit Converter - konversi satuan secara lokal.
 * Mendukung: panjang, berat, suhu, kecepatan, luas, volume, waktu, data.
 * 100% gratis, tidak perlu API.
 */

type ConversionEntry = {
  from: string;
  to: string;
  factor: number; // multiply by factor to convert from -> to
  offset?: number; // add offset after multiply (for temperature)
};

// Semua satuan dikonversi ke satuan "base" masing-masing kategori,
// lalu dari base ke satuan target.
const CONVERSIONS: Record<string, Record<string, ConversionEntry>> = {
  // ─── PANJANG ─────────────────────────────────────
  panjang: {
    "km-m": { from: "km", to: "m", factor: 1000 },
    "km-cm": { from: "km", to: "cm", factor: 100000 },
    "km-mm": { from: "km", to: "mm", factor: 1000000 },
    "km-mile": { from: "km", to: "mile", factor: 0.621371 },
    "km-yard": { from: "km", to: "yard", factor: 1093.61 },
    "km-foot": { from: "km", to: "foot", factor: 3280.84 },
    "km-inch": { from: "km", to: "inch", factor: 39370.1 },
    "km-nm": { from: "km", to: "nm", factor: 539.957 },
    "m-cm": { from: "m", to: "cm", factor: 100 },
    "m-mm": { from: "m", to: "mm", factor: 1000 },
    "m-mile": { from: "m", to: "mile", factor: 0.000621371 },
    "m-yard": { from: "m", to: "yard", factor: 1.09361 },
    "m-foot": { from: "m", to: "foot", factor: 3.28084 },
    "m-inch": { from: "m", to: "inch", factor: 39.3701 },
    "mile-foot": { from: "mile", to: "foot", factor: 5280 },
    "mile-yard": { from: "mile", to: "yard", factor: 1760 },
    "foot-inch": { from: "foot", to: "inch", factor: 12 },
  },

  // ─── BERAT ───────────────────────────────────────
  berat: {
    "kg-g": { from: "kg", to: "g", factor: 1000 },
    "kg-mg": { from: "kg", to: "mg", factor: 1000000 },
    "kg-ton": { from: "kg", to: "ton", factor: 0.001 },
    "kg-lbs": { from: "kg", to: "lbs", factor: 2.20462 },
    "kg-oz": { from: "kg", to: "oz", factor: 35.274 },
    "lbs-oz": { from: "lbs", to: "oz", factor: 16 },
    "lbs-g": { from: "lbs", to: "g", factor: 453.592 },
    "ton-kg": { from: "ton", to: "kg", factor: 1000 },
  },

  // ─── SUHU ────────────────────────────────────────
  suhu: {
    "c-f": { from: "c", to: "f", factor: 1.8, offset: 32 },
    "c-k": { from: "c", to: "k", factor: 1, offset: 273.15 },
    "f-c": { from: "f", to: "c", factor: 1 / 1.8, offset: -32 / 1.8 },
    "f-k": { from: "f", to: "k", factor: 1 / 1.8, offset: (273.15 - 32 / 1.8) },
    "k-c": { from: "k", to: "c", factor: 1, offset: -273.15 },
    "k-f": { from: "k", to: "f", factor: 1.8, offset: 273.15 * 1.8 },
  },

  // ─── KECEPATAN ───────────────────────────────────
  kecepatan: {
    "kmh-ms": { from: "km/h", to: "m/s", factor: 1 / 3.6 },
    "kmh-mph": { from: "km/h", to: "mph", factor: 0.621371 },
    "kmh-knot": { from: "km/h", to: "knot", factor: 0.539957 },
    "ms-kmh": { from: "m/s", to: "km/h", factor: 3.6 },
    "ms-mph": { from: "m/s", to: "mph", factor: 2.23694 },
    "mph-ms": { from: "mph", to: "m/s", factor: 0.44704 },
    "mph-kmh": { from: "mph", to: "km/h", factor: 1.60934 },
    "knot-kmh": { from: "knot", to: "km/h", factor: 1.852 },
    "knot-mph": { from: "knot", to: "mph", factor: 1.15078 },
  },

  // ─── LUAS ────────────────────────────────────────
  luas: {
    "sqm-sqcm": { from: "m²", to: "cm²", factor: 10000 },
    "sqm-sqft": { from: "m²", to: "ft²", factor: 10.7639 },
    "sqm-sqyd": { from: "m²", to: "yd²", factor: 1.19599 },
    "sqm-hectare": { from: "m²", to: "hectare", factor: 0.0001 },
    "sqm-acre": { from: "m²", to: "acre", factor: 0.000247105 },
    "sqft-sqin": { from: "ft²", to: "in²", factor: 144 },
    "hectare-acre": { from: "hectare", to: "acre", factor: 2.47105 },
  },

  // ─── VOLUME ──────────────────────────────────────
  volume: {
    "l-ml": { from: "L", to: "mL", factor: 1000 },
    "l-gal": { from: "L", to: "gal", factor: 0.264172 },
    "l-qt": { from: "L", to: "qt", factor: 1.05669 },
    "l-pt": { from: "L", to: "pt", factor: 2.11338 },
    "l-cup": { from: "L", to: "cup", factor: 4.22675 },
    "l-tbsp": { from: "L", to: "tbsp", factor: 67.628 },
    "l-tsp": { from: "L", to: "tsp", factor: 202.884 },
    "gal-l": { from: "gal", to: "L", factor: 3.78541 },
    "gal-qt": { from: "gal", to: "qt", factor: 4 },
  },

  // ─── WAKTU ───────────────────────────────────────
  waktu: {
    "h-min": { from: "jam", to: "menit", factor: 60 },
    "h-s": { from: "jam", to: "detik", factor: 3600 },
    "h-ms": { from: "jam", to: "milidetik", factor: 3600000 },
    "min-s": { from: "menit", to: "detik", factor: 60 },
    "min-ms": { from: "menit", to: "milidetik", factor: 60000 },
    "s-ms": { from: "detik", to: "milidetik", factor: 1000 },
    "day-h": { from: "hari", to: "jam", factor: 24 },
    "week-day": { from: "minggu", to: "hari", factor: 7 },
    "month-day": { from: "bulan", to: "hari", factor: 30.44 },
    "year-month": { from: "tahun", to: "bulan", factor: 12 },
    "year-day": { from: "tahun", to: "hari", factor: 365.25 },
  },

  // ─── DATA ────────────────────────────────────────
  data: {
    "kb-b": { from: "KB", to: "B", factor: 1024 },
    "mb-kb": { from: "MB", to: "KB", factor: 1024 },
    "mb-b": { from: "MB", to: "B", factor: 1048576 },
    "gb-mb": { from: "GB", to: "MB", factor: 1024 },
    "gb-b": { from: "GB", to: "B", factor: 1073741824 },
    "tb-gb": { from: "TB", to: "GB", factor: 1024 },
    "tb-b": { from: "TB", to: "B", factor: 1099511627776 },
    "bit-b": { from: "bit", to: "B", factor: 0.125 },
    "b-bit": { from: "B", to: "bit", factor: 8 },
    "kb-bit": { from: "KB", to: "bit", factor: 8192 },
    "mb-bit": { from: "MB", to: "bit", factor: 8388608 },
    "gb-bit": { from: "GB", to: "bit", factor: 8589934592 },
  },
};

// Alias untuk memudahkan pencarian
const ALIASES: Record<string, string> = {
  // Panjang
  kilometer: "km", km: "km",
  meter: "m", m: "m",
  centimeter: "cm", cm: "cm",
  millimeter: "mm", mm: "mm",
  mile: "mile", miles: "mile",
  yard: "yard", yards: "yard",
  foot: "foot", feet: "foot", ft: "foot",
  inch: "inch", inches: "inch", in: "inch",
  "nautical mile": "nm", nm: "nm",
  // Berat
  kilogram: "kg", kg: "kg",
  gram: "g", g: "g",
  miligram: "mg", mg: "mg",
  ton: "ton",
  pound: "lbs", lbs: "lbs",
  ounce: "oz", oz: "oz",
  // Suhu
  celsius: "c", "°c": "c",
  fahrenheit: "f", "°f": "f",
  kelvin: "k",
  // Kecepatan
  "km/h": "km/h", "kmh": "km/h",
  "m/s": "m/s", "ms": "m/s",
  mph: "mph",
  knot: "knot", knots: "knot",
  // Luas
  "m²": "m²", "m2": "m²",
  "cm²": "cm²", "cm2": "cm²",
  "ft²": "ft²", "ft2": "ft²", sqft: "ft²",
  hectare: "hectare", hectares: "hectare",
  acre: "acre", acres: "acre",
  // Volume
  liter: "L", liters: "L", l: "L",
  ml: "mL", "milliliter": "mL", "mililiter": "mL",
  galon: "gal", gallon: "gal", gallons: "gal",
  // Waktu
  jam: "jam", hour: "jam", hours: "jam", h: "jam",
  menit: "menit", minute: "menit", minutes: "menit", min: "menit",
  detik: "detik", second: "detik", seconds: "detik", s: "detik",
  hari: "hari", day: "hari", days: "hari",
  minggu: "minggu", week: "minggu", weeks: "minggu",
  bulan: "bulan", month: "bulan", months: "bulan",
  tahun: "tahun", year: "tahun", years: "tahun",
  // Data
  kb: "KB", mb: "MB", gb: "GB", tb: "TB",
};

function resolveUnit(input: string): string {
  const lower = input.toLowerCase().trim();
  if (ALIASES[lower]) return ALIASES[lower];
  if (ALIASES[input.trim()]) return ALIASES[input.trim()];
  return input.trim();
}

/**
 * Cari rute konversi dari satu satuan ke satuan lain.
 * Menggunakan BFS sederhana pada graph konversi.
 */
function findConversionPath(
  category: Record<string, ConversionEntry>,
  fromUnit: string,
  toUnit: string,
): ConversionEntry[] | null {
  // Cari semua pasangan yang cocok
  const entries = Object.values(category);

  // Build adjacency: from -> [entries]
  const adj = new Map<string, ConversionEntry[]>();
  for (const entry of entries) {
    if (!adj.has(entry.from)) adj.set(entry.from, []);
    if (!adj.has(entry.to)) adj.set(entry.to, []);
    adj.get(entry.from)!.push(entry);
    // Reverse entry
    adj.get(entry.to)!.push({
      from: entry.to,
      to: entry.from,
      factor: 1 / entry.factor,
      offset: entry.offset ? -entry.offset / entry.factor : undefined,
    });
  }

  // BFS
  const queue: { node: string; path: ConversionEntry[] }[] = [{ node: fromUnit, path: [] }];
  const visited = new Set<string>([fromUnit]);

  while (queue.length > 0) {
    const { node, path } = queue.shift()!;
    if (node === toUnit && path.length > 0) return path;

    for (const neighbor of adj.get(node) || []) {
      const next = neighbor.to;
      if (!visited.has(next)) {
        visited.add(next);
        queue.push({ node: next, path: [...path, neighbor] });
      }
    }
  }
  return null;
}

/**
 * Konversi nilai dari satu satuan ke satuan lain.
 * @param value - nilai yang akan dikonversi
 * @param from - satuan asal (contoh: "km", "kg", "celsius")
 * @param to - satuan tujuan (contoh: "mile", "lbs", "fahrenheit")
 * @returns string hasil konversi atau pesan error
 */
export function convertUnit(value: number, from: string, to: string): string {
  const fromResolved = resolveUnit(from);
  const toResolved = resolveUnit(to);

  if (isNaN(value)) return "Error: Nilai tidak valid.";

  // Cari di semua kategori
  for (const [, category] of Object.entries(CONVERSIONS)) {
    // Langsung cek pasangan
    for (const entry of Object.values(category)) {
      if (entry.from === fromResolved && entry.to === toResolved) {
        const result = entry.offset !== undefined
          ? value * entry.factor + entry.offset
          : value * entry.factor;
        return formatResult(result, value, from, to);
      }
    }

    // Cari path konversi
    const path = findConversionPath(category, fromResolved, toResolved);
    if (path) {
      let result = value;
      for (const step of path) {
        result = step.offset !== undefined
          ? result * step.factor + step.offset
          : result * step.factor;
      }
      return formatResult(result, value, from, to);
    }
  }

  // Tidak ditemukan
  const supported = new Set<string>();
  for (const category of Object.values(CONVERSIONS)) {
    for (const entry of Object.values(category)) {
      supported.add(entry.from);
      supported.add(entry.to);
    }
  }
  return `Error: Konversi dari '${from}' ke '${to}' tidak didukung. Coba: ${[...supported].slice(0, 20).join(", ")}, dll.`;
}

function formatResult(result: number, original: number, from: string, to: string): string {
  const formatted = Number.isInteger(result)
    ? result.toString()
    : parseFloat(result.toPrecision(10)).toString();
  return `${original} ${from} = ${formatted} ${to}`;
}
