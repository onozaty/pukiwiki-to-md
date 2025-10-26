import { describe, expect, it } from "vitest";
import { convertToMarkdown } from "./converter";

describe("convertToMarkdown", () => {
  describe("heading conversion", () => {
    it("should convert level 1 heading", () => {
      const input = "*はじめに";
      const expected = "# はじめに";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert level 2 heading", () => {
      const input = "**セクション";
      const expected = "## セクション";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert level 3 heading", () => {
      const input = "***サブセクション";
      const expected = "### サブセクション";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should not convert asterisks in the middle of line", () => {
      const input = "This is * not a heading";
      expect(convertToMarkdown(input, "テストページ")).toBe(input);
    });

    it("should convert multiple headings", () => {
      const input = "*タイトル\n\nコンテンツ\n\n**サブタイトル";
      const expected = "# タイトル\n\nコンテンツ\n\n## サブタイトル";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });
  });

  describe("horizontal rule conversion", () => {
    it("should convert 4 hyphens horizontal rule", () => {
      const input = "----";
      const expected = "---";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert 5 or more hyphens", () => {
      const input = "-----";
      const expected = "---";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should handle horizontal rule with spaces", () => {
      const input = "   ----   ";
      const expected = "---";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert #hr plugin to horizontal rule", () => {
      const input = "#hr";
      const expected = "---";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert #hr with spaces", () => {
      const input = "  #hr  ";
      const expected = "---";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should not convert dashes in text", () => {
      const input = "This is a --- test";
      expect(convertToMarkdown(input, "テストページ")).toBe(input);
    });

    it("should not convert three dashes", () => {
      const input = "---";
      expect(convertToMarkdown(input, "テストページ")).toBe(input);
    });
  });

  describe("quote conversion", () => {
    it("should convert level 1 quote", () => {
      const input = ">引用文";
      const expected = "> 引用文";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert level 2 quote", () => {
      const input = ">>ネスト引用";
      const expected = "> > ネスト引用";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert level 3 quote", () => {
      const input = ">>>深いネスト";
      const expected = "> > > 深いネスト";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should convert multiple quotes", () => {
      const input = ">引用1\n>>引用2\n>引用3";
      const expected = "> 引用1\n> > 引用2\n> 引用3";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });
  });

  describe("mixed conversions", () => {
    it("should handle multiple syntax types in one content", () => {
      const input = "*見出し\n\n普通のテキスト\n\n>引用\n\n----";
      const expected = "# 見出し\n\n普通のテキスト\n\n> 引用\n\n---";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should not convert syntax that doesn't match heading pattern", () => {
      const input = "* This is not a heading (has space after asterisk)";
      const expected = "* This is not a heading (has space after asterisk)";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should correctly handle valid and invalid syntax mix", () => {
      const input = "* Not heading\n*Valid heading\n>Quote\nNormal text";
      const expected = "* Not heading\n# Valid heading\n> Quote\nNormal text";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });

    it("should preserve empty lines", () => {
      const input = "*Heading\n\n\n>Quote";
      const expected = "# Heading\n\n\n> Quote";
      expect(convertToMarkdown(input, "テストページ")).toBe(expected);
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      expect(convertToMarkdown("", "テストページ")).toBe("");
    });

    it("should handle single line with no syntax", () => {
      const input = "Just plain text";
      expect(convertToMarkdown(input, "テストページ")).toBe(input);
    });

    it("should handle only newlines", () => {
      const input = "\n\n\n";
      expect(convertToMarkdown(input, "テストページ")).toBe(input);
    });
  });
});
