import { describe, expect, it } from "vitest";
import { decodeFileName, splitPagePath } from "./utils";

describe("decodeFileName", () => {
  it("should decode EUC-JP encoded filename", () => {
    // "テスト" in EUC-JP
    const encoded = "A5C6A5B9A5C8";
    const decoded = decodeFileName(encoded, "euc-jp");
    expect(decoded).toBe("テスト");
  });

  it("should decode complex Japanese filename", () => {
    // "プロジェクト" in EUC-JP
    const encoded = "A5D7A5EDA5B8A5A7A5AFA5C8";
    const decoded = decodeFileName(encoded, "euc-jp");
    expect(decoded).toBe("プロジェクト");
  });

  it("should decode UTF-8 encoded filename", () => {
    // "テスト" in UTF-8
    const encoded = "E38386E382B9E38388";
    const decoded = decodeFileName(encoded, "utf-8");
    expect(decoded).toBe("テスト");
  });

  it("should handle page names with slashes", () => {
    // "プロジェクト/タスク" in EUC-JP  (/ = 2F)
    const encoded = "A5D7A5EDA5B8A5A7A5AFA5C82FA5BFA5B9A5AF";
    const decoded = decodeFileName(encoded, "euc-jp");
    expect(decoded).toBe("プロジェクト/タスク");
  });
});

describe("splitPagePath", () => {
  it("should split page path with directory", () => {
    const result = splitPagePath("プロジェクト/タスク");
    expect(result).toEqual({ dir: "プロジェクト", name: "タスク" });
  });

  it("should handle nested directories", () => {
    const result = splitPagePath("プロジェクト/タスク/詳細");
    expect(result).toEqual({ dir: "プロジェクト/タスク", name: "詳細" });
  });

  it("should handle page without directory", () => {
    const result = splitPagePath("トップページ");
    expect(result).toEqual({ dir: "", name: "トップページ" });
  });

  it("should handle single slash", () => {
    const result = splitPagePath("カテゴリ/");
    expect(result).toEqual({ dir: "カテゴリ", name: "" });
  });
});
