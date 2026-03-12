import { marked } from "marked";
import DOMPurify from "dompurify";

export function renderMarkdown(raw: string): string {
  const html = marked.parse(raw) as string;
  return DOMPurify.sanitize(html);
}
