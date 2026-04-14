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

  describe("html escaping", () => {
    it("escapes raw html tags and displays them as text", () => {
      const result = renderMarkdown("<h1>Heading</h1>");
      expect(result).toEqual("<p>&lt;h1&gt;Heading&lt;/h1&gt;</p>\n");
    });

    it("escapes html attributes in raw tags", () => {
      const result = renderMarkdown('<img src="x" onerror="alert(1)">');
      expect(result).toEqual('<p>&lt;img src="x" onerror="alert(1)"&gt;</p>\n');
    });

    it("works correctly with markdown combined with raw html", () => {
      const result = renderMarkdown("**Bold** and <div>Tag</div>");
      expect(result).toEqual(
        "<p><strong>Bold</strong> and &lt;div&gt;Tag&lt;/div&gt;</p>\n",
      );
    });

    it("escapes special characters correctly", () => {
      const result = renderMarkdown("& < > \" '");
      // Adjusted to match DOMPurify's behavior of unescaping quotes in text nodes
      expect(result).toEqual("<p>&amp; &lt; &gt; \" '</p>\n");
    });
  });

  describe("sanitization vs escaping", () => {
    it("escapes script tags instead of removing them", () => {
      const malicious = "Dangerous <script>alert('XSS')</script> content";
      const result = renderMarkdown(malicious);

      expect(result).toContain("&lt;script&gt;");
      expect(result).toContain("alert('XSS')");
      expect(result).toEqual(
        "<p>Dangerous &lt;script&gt;alert('XSS')&lt;/script&gt; content</p>\n",
      );
    });

    it("blocks javascript: links through marked/dompurify while escaping the label if needed", () => {
      const malicious = "[Click me](javascript:alert(1))";
      const result = renderMarkdown(malicious);

      expect(result).not.toContain('href="javascript:');
      expect(result).toContain("<a>Click me</a>");
    });
  });
});
