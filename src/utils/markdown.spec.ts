import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./markdown";

describe("markdown validation", () => {
  describe("basic rendering", () => {
    it("parses h1 headers correctly", () => {
      const result = renderMarkdown("# Heading");
      expect(result).toEqual("<h1>Heading</h1>\n");
    });

    it("parses paragraphs correctly", () => {
      const result = renderMarkdown("Paragraph");
      expect(result).toEqual("<p>Paragraph</p>\n");
    });

    it("parses bold and italic text correctly", () => {
      const result = renderMarkdown("**Bold** *Italic*");
      expect(result).toEqual("<p><strong>Bold</strong> <em>Italic</em></p>\n");
    });

    it("parses links correctly", () => {
      const result = renderMarkdown("[link](source)");
      expect(result).toEqual('<p><a href="source">link</a></p>\n');
    });

    it("parses images correctly", () => {
      const result = renderMarkdown("![Alt](https://example.com/image.png)");
      expect(result).toEqual(
        '<p><img src="https://example.com/image.png" alt="Alt"></p>\n',
      );
    });
  });

  describe("syntax highlighting", () => {
    it("generates correct classes for registered languages (typescript)", () => {
      const code = "```typescript\nconst x: number = 1;\n```";
      const result = renderMarkdown(code);
      expect(result).toContain('class="hljs language-typescript"');
      expect(result).toContain('<span class="hljs-keyword">const</span>');
    });

    it("uses hljs class when another language is specified", () => {
      const code = "```python\nsome text\n```";
      const result = renderMarkdown(code);

      expect(result).toContain('class="hljs');
    });

    it("uses hljs class when no language is specified", () => {
      const code = "```\nsome text\n```";
      const result = renderMarkdown(code);

      expect(result).toContain('class="hljs"');
    });
  });

  describe("sanitization", () => {
    it("removes script tags", () => {
      const malicious = "Dangerous <script>alert('XSS')</script> content";
      const result = renderMarkdown(malicious);

      expect(result).not.toContain("<script>");
      expect(result).toContain("<p>Dangerous  content</p>");
    });

    it("removes dangerous attributes like onerror", () => {
      const malicious = '<img src="x" onerror="alert(1)">';
      const result = renderMarkdown(malicious);

      expect(result).not.toContain("onerror");
      expect(result).toContain('<img src="x">');
    });

    it("blocks javascript: links", () => {
      const malicious = "[Click me](javascript:alert(1))";
      const result = renderMarkdown(malicious);

      expect(result).not.toContain('href="javascript:');
      expect(result).toContain("<a>Click me</a>");
    });
  });
});
