// components/Markdown.tsx

import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { ScrollView as GHScrollView } from "react-native-gesture-handler";
import {
  Renderer,
  useMarkdown,
  type MarkedStyles,
  type RendererInterface,
} from "react-native-marked";

import { useAppTheme } from "@/context/ThemeContext";
import {
  DARK_COLORS,
  LIGHT_COLORS,
  highlightCode,
  highlightCodeLines,
} from "@/lib/syntax-highlight";
import { sanitizeMarkdown } from "@/lib/markdown";

const MONO = Platform.select({
  ios: "Menlo",
  android: "monospace",
  web: "ui-monospace, SFMono-Regular, Menlo, monospace",
  default: "monospace",
});

function openLink(url: string) {
  if (Platform.OS === "web") Linking.openURL(url);
  else WebBrowser.openBrowserAsync(url).catch(() => Linking.openURL(url));
}

function assignKeys(node: ReactNode, path: string): ReactNode {
  if (Array.isArray(node)) {
    return node.map((child, i) => assignKeys(child, `${path}${i}`));
  }
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<Record<string, unknown>>;
    const key = el.key != null ? el.key : path;
    const kids =
      el.props.children != null
        ? assignKeys(el.props.children as ReactNode, `${path}_`)
        : el.props.children;
    return React.cloneElement(el, { key, children: kids });
  }
  return node;
}

/* ─── Palette adapter ─── */

type Palette = {
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  border: string;
  borderStrong: string;
  surface: string;
  surfaceStrong: string;
  input: string;
  code: string;
  codeText: string;
};

function usePalette(): Palette {
  const { colors, scheme } = useAppTheme();
  const isDark = scheme === "dark";
  return useMemo(
    () => ({
      text: colors.text,
      textSecondary: colors.textSecondary,
      textMuted: colors.textMuted,
      accent: colors.accent,
      accentSoft: colors.accentSoft,
      border: colors.border,
      borderStrong: colors.surfaceBorder,
      surface: colors.surface,
      surfaceStrong: colors.backgroundElement,
      input: colors.inputBg,
      code: isDark ? "#0E0F11" : "#F6F5FA",
      codeText: isDark ? "#E4E4E7" : "#34333E",
    }),
    [colors, isDark],
  );
}

/* ─── Styles ─── */

function buildStyles(c: Palette): MarkedStyles {
  return {
    text: { color: c.text, fontSize: 15, lineHeight: 23 },
    paragraph: { paddingVertical: 0, marginBottom: 8 },
    strong: { fontWeight: "700" },
    em: { fontStyle: "italic" },
    strikethrough: { textDecorationLine: "line-through" },
    link: { color: c.accent, textDecorationLine: "none", fontWeight: "600" },
    h1: {
      fontSize: 22,
      fontWeight: "800",
      lineHeight: 30,
      marginTop: 16,
      marginBottom: 8,
      color: c.text,
    },
    h2: {
      fontSize: 19,
      fontWeight: "800",
      lineHeight: 27,
      marginTop: 14,
      marginBottom: 6,
      color: c.text,
    },
    h3: {
      fontSize: 17,
      fontWeight: "700",
      lineHeight: 24,
      marginTop: 12,
      marginBottom: 5,
      color: c.text,
    },
    h4: {
      fontSize: 15,
      fontWeight: "700",
      lineHeight: 22,
      marginTop: 10,
      marginBottom: 4,
      color: c.text,
    },
    h5: {
      fontSize: 14,
      fontWeight: "700",
      lineHeight: 20,
      marginTop: 8,
      marginBottom: 4,
      color: c.text,
    },
    h6: {
      fontSize: 13,
      fontWeight: "700",
      lineHeight: 19,
      marginTop: 8,
      marginBottom: 4,
      color: c.text,
      fontStyle: "italic",
    },
    codespan: {
      fontFamily: MONO,
      fontSize: 13,
      fontWeight: "500",
      color: c.codeText,
      backgroundColor: c.code,
      borderRadius: 5,
      paddingHorizontal: 5,
      paddingVertical: 2,
      overflow: "hidden",
    },
    code: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: c.code,
      borderRadius: 0,
    },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: c.accent,
      paddingLeft: 12,
      marginVertical: 6,
      opacity: 0.92,
    },
    hr: {
      borderBottomColor: c.border,
      borderBottomWidth: 1,
      marginVertical: 14,
    },
    list: { marginVertical: 2, paddingLeft: 4 },
    li: { fontSize: 15, lineHeight: 23, color: c.text, marginBottom: 3 },
    image: {
      width: "100%",
      height: 180,
      borderRadius: 10,
      marginVertical: 8,
      resizeMode: "contain",
    },
    table: { borderWidth: 1, borderColor: c.borderStrong, marginVertical: 10 },
    tableRow: { flexDirection: "row" },
    tableCell: { padding: 10 },
  };
}

/* ─── Renderer ─── */

class ChatRenderer extends Renderer implements RendererInterface {
  private _idx = 0;
  private p: Palette;
  private _copiedRef: React.MutableRefObject<string | null>;
  private _onCopy: (t: string) => void;
  private _isDark: boolean;

  constructor(
    palette: Palette,
    copiedRef: React.MutableRefObject<string | null>,
    onCopy: (t: string) => void,
    isDark: boolean,
  ) {
    super();
    this.p = palette;
    this._copiedRef = copiedRef;
    this._onCopy = onCopy;
    this._isDark = isDark;
  }

  private k(children: ReactNode[] | string, tag: string): ReactNode[] {
    const arr = typeof children === "string" ? [children] : children;
    return arr.map((c, i) => assignKeys(c, `${tag}${i}`));
  }

  strong(children: string | ReactNode[], s?: TextStyle): ReactNode {
    return super.strong(this.k(children as ReactNode[], "b"), s);
  }
  em(children: string | ReactNode[], s?: TextStyle): ReactNode {
    return super.em(this.k(children as ReactNode[], "i"), s);
  }
  del(children: string | ReactNode[], s?: TextStyle): ReactNode {
    return super.del(this.k(children as ReactNode[], "d"), s);
  }
  paragraph(children: ReactNode[], s?: ViewStyle): ReactNode {
    return super.paragraph(this.k(children, "p"), s);
  }
  blockquote(children: ReactNode[], s?: ViewStyle): ReactNode {
    return super.blockquote(this.k(children, "q"), s);
  }
  listItem(children: ReactNode[], s?: ViewStyle): ReactNode {
    return super.listItem(this.k(children, "lt"), s);
  }

  /* ── Table ── */
  table(
    header: ReactNode[][],
    rows: ReactNode[][][],
    ts?: ViewStyle,
    rs?: ViewStyle,
    cs?: ViewStyle,
  ): React.ReactNode {
    const p = this.p;
    const cols = header.length;
    const id = this._idx++;
    const CELL_W = 150;

    const headerCellBase: ViewStyle = {
      paddingVertical: 10,
      paddingHorizontal: 12,
      width: CELL_W,
      borderBottomWidth: 2,
      borderBottomColor: p.borderStrong,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: p.border,
    };

    const bodyCellBase: ViewStyle = {
      paddingVertical: 10,
      paddingHorizontal: 12,
      width: CELL_W,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: p.border,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: p.border,
    };

    return (
      <View key={`tbl${id}`} style={st.tableWrap}>
        <GHScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
        >
          <View style={st.table}>
            {/* header */}
            <View style={[st.tableRow, { backgroundColor: p.surfaceStrong }]}>
              {header.map((cells, i) => (
                <View
                  key={`th${id}-${i}`}
                  style={[headerCellBase, cs, i === cols - 1 && st.noRightBorder]}
                >
                  <Text style={[st.th, { color: p.text }]}>
                    {assignKeys(cells, `th${id}-${i}`)}
                  </Text>
                </View>
              ))}
            </View>
            {/* body rows */}
            {rows.map((row, ri) => (
              <View
                key={`tr${id}-${ri}`}
                style={[
                  st.tableRow,
                  { backgroundColor: ri % 2 === 0 ? p.surface : p.input },
                ]}
              >
                {row.map((cells, ci) => (
                  <View
                    key={`td${id}-${ri}-${ci}`}
                    style={[bodyCellBase, cs, ci === cols - 1 && st.noRightBorder]}
                  >
                    <Text style={[st.td, { color: p.text }]}>
                      {assignKeys(cells, `td${id}-${ri}-${ci}`)}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </GHScrollView>
      </View>
    );
  }

  /* ── Code block ── */
  code(
    text: string,
    language?: string,
    containerStyle?: ViewStyle,
    textStyle?: TextStyle,
  ): ReactNode {
    const p = this.p;
    const id = this._idx++;
    const hlColors = this._isDark ? DARK_COLORS : LIGHT_COLORS;
    const baseStyle: TextStyle = {
      fontFamily: MONO,
      fontSize: 13,
      lineHeight: 20,
    };

    const hasLineNumbers = text.split("\n").length > 2;
    const lines = hasLineNumbers ? highlightCodeLines(text, language, hlColors) : null;

    return (
      <View
        key={`code${id}`}
        style={[
          st.codeShell,
          { backgroundColor: p.code, borderColor: p.border },
          containerStyle,
        ]}
      >
        <View style={[st.codeHeader, { borderBottomColor: p.border }]}>
          <Text style={[st.codeLang, { color: p.textMuted }]}>
            {language || "code"}
          </Text>
          <Pressable
            hitSlop={8}
            onPress={() => this._onCopy(text)}
            style={({ pressed }) => [st.copyBtn, pressed && { opacity: 0.5 }]}
          >
            <Text style={[st.copyText, { color: p.accent }]}>
              {this._copiedRef.current === text ? "✓ Tersalin" : "Salin"}
            </Text>
          </Pressable>
        </View>
        <GHScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
        >
          {lines ? (
            <View style={{ paddingVertical: 10 }}>
              {lines.map((line) => (
                <View key={`line${line.line}`} style={st.codeLineRow}>
                  <Text
                    style={[
                      st.lineNumber,
                      { color: p.textMuted, borderRightColor: p.border },
                    ]}
                  >
                    {line.line}
                  </Text>
                  <View style={{ paddingHorizontal: 12, flex: 1 }}>
                    <Text selectable style={baseStyle}>
                      {line.tokens.length === 0
                        ? " "
                        : line.tokens.map((tok, ti) => (
                            <Text key={`tk${line.line}-${ti}`} style={[baseStyle, { color: tok.color }]}>
                              {tok.value}
                            </Text>
                          ))}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
              <Text selectable>
                {highlightCode(text, language, hlColors, baseStyle)}
              </Text>
            </View>
          )}
        </GHScrollView>
      </View>
    );
  }

  /* ── Link ── */
  link(
    children: string | ReactNode[],
    href: string,
    linkStyle?: TextStyle,
    title?: string,
  ): ReactNode {
    return (
      <Text
        key={`lnk${href}`}
        selectable
        accessibilityRole="link"
        accessibilityLabel={title || "Tautan"}
        onPress={() => openLink(href)}
        style={linkStyle}
      >
        {assignKeys(children, `lk${href}`)}
      </Text>
    );
  }
}

/* ─── Component ─── */

type MarkdownTextProps = {
  children: string;
  streaming?: boolean;
};

export function MarkdownText({ children, streaming }: MarkdownTextProps) {
  const { scheme } = useAppTheme();
  const isDark = scheme === "dark";
  const palette = usePalette();

  const [copied, setCopied] = useState<string | null>(null);
  const copiedRef = useRef<string | null>(null);
  useEffect(() => {
    copiedRef.current = copied;
  });

  const handleCopy = useCallback((text: string) => {
    Clipboard.setStringAsync(text)
      .then(() => {
        Haptics.selectionAsync();
        setCopied(text);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const renderer = useMemo(
    () => new ChatRenderer(palette, copiedRef, handleCopy, isDark),
    [palette, handleCopy, isDark],
  );
  const styles = useMemo(() => buildStyles(palette), [palette]);
  const content = useMemo(() => sanitizeMarkdown(children), [children]);
  const elements = useMarkdown(content || "", {
    colorScheme: isDark ? "dark" : "light",
    renderer,
    styles,
  });

  return <View>{elements}</View>;
}

/* ─── Local StyleSheet ─── */

const st = StyleSheet.create({
  tableWrap: { marginVertical: 10, borderRadius: 12, overflow: "hidden" },
  table: { overflow: "hidden" },
  tableRow: { flexDirection: "row" },
  noRightBorder: { borderRightWidth: 0 },
  th: { fontSize: 13, fontWeight: "700", lineHeight: 18 },
  td: { fontSize: 14, lineHeight: 21 },

  codeShell: {
    marginVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  codeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  codeLang: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  copyBtn: { paddingHorizontal: 4, paddingVertical: 2 },
  copyText: { fontSize: 11, fontWeight: "700" },
  codeLineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    minWidth: 200,
  },
  lineNumber: {
    fontFamily: MONO,
    fontSize: 11,
    lineHeight: 20,
    minWidth: 36,
    textAlign: "right",
    paddingHorizontal: 8,
    borderRightWidth: StyleSheet.hairlineWidth,
    userSelect: "none",
  } as TextStyle,
});
