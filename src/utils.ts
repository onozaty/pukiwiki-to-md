import iconv from "iconv-lite";

/**
 * Decode PukiWiki encoded filename
 *
 * PukiWiki uses URL encoding without percent signs
 * Example: "A5C6A5B9A5C8" → "テスト" (EUC-JP)
 *
 * @param encoded - Encoded filename (without extension)
 * @param encoding - Source encoding
 * @returns Decoded string
 */
export const decodeFileName = (encoded: string, encoding: string): string => {
  // Insert % every 2 characters
  const withPercent = encoded.replace(/([0-9A-Fa-f]{2})/g, "%$1");

  // Convert hex string to byte array
  const bytes: number[] = [];
  for (let i = 0; i < withPercent.length; i++) {
    if (withPercent[i] === "%" && i + 2 < withPercent.length) {
      const hex = withPercent.substring(i + 1, i + 3);
      bytes.push(parseInt(hex, 16));
      i += 2;
    } else {
      bytes.push(withPercent.charCodeAt(i));
    }
  }

  // Convert byte array to buffer and decode
  const buffer = Buffer.from(bytes);
  return iconv.decode(buffer, encoding);
};

/**
 * Convert buffer from specified encoding to UTF-8 string
 *
 * @param buffer - Source buffer
 * @param fromEncoding - Source encoding
 * @returns UTF-8 string
 */
export const convertEncoding = (
  buffer: Buffer,
  fromEncoding: string,
): string => {
  return iconv.decode(buffer, fromEncoding);
};

/**
 * Split page path into directory and filename
 *
 * Example: "プロジェクト/タスク/詳細" → { dir: "プロジェクト/タスク", name: "詳細" }
 * Example: "トップページ" → { dir: "", name: "トップページ" }
 *
 * @param pageName - Page name (slash-separated)
 * @returns Directory path and filename
 */
export const splitPagePath = (
  pageName: string,
): { dir: string; name: string } => {
  const lastSlashIndex = pageName.lastIndexOf("/");

  if (lastSlashIndex === -1) {
    return { dir: "", name: pageName };
  }

  return {
    dir: pageName.substring(0, lastSlashIndex),
    name: pageName.substring(lastSlashIndex + 1),
  };
};
