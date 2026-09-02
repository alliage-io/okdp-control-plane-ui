import type { ReactNode } from 'react';

/* A small Markdown renderer for the usage notes charts publish in their
   instance descriptor. It builds React elements (never HTML strings), so a
   chart cannot inject markup, and it only covers what those notes use:
   headings, paragraphs, lists, fenced code, inline code, bold, italics, links
   and bare URLs. Anything else is shown as text. */

const INLINE_RE =
  /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)\s]+\))|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])|(\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;

/** Only web and mail links are followed; a `javascript:` URL stays text. */
function safeHref(url: string): string | null {
  return /^(https?:|mailto:)/i.test(url) ? url : null;
}

function link(href: string, label: ReactNode, key: number): ReactNode {
  return (
    <a key={key} className="info-link" href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}

function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(INLINE_RE)) {
    const [token] = match;
    const start = match.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    if (match[1]) {
      out.push(
        <code key={key++} className="mono">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (match[2]) {
      out.push(<strong key={key++}>{renderInline(token.slice(2, -2))}</strong>);
    } else if (match[3]) {
      const split = token.indexOf('](');
      const label = token.slice(1, split);
      const href = safeHref(token.slice(split + 2, -1));
      out.push(href ? link(href, renderInline(label), key++) : label);
    } else if (match[4]) {
      out.push(link(token, token, key++));
    } else {
      out.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    last = start + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'code'; text: string };

const UL_RE = /^\s*[-*+]\s+(.*)$/;
const OL_RE = /^\s*\d+[.)]\s+(.*)$/;
const HEADING_RE = /^(#{1,6})\s+(.*?)\s*#*\s*$/;

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (/^\s*```/.test(line)) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i++]);
      i++; // closing fence (or end of text)
      blocks.push({ kind: 'code', text: code.join('\n') });
      continue;
    }
    const heading = HEADING_RE.exec(line);
    if (heading) {
      blocks.push({ kind: 'heading', level: heading[1].length, text: heading[2] });
      i++;
      continue;
    }
    const listRe = UL_RE.test(line) ? UL_RE : OL_RE.test(line) ? OL_RE : null;
    if (listRe) {
      const items: string[] = [];
      while (i < lines.length && listRe.test(lines[i])) {
        items.push(listRe.exec(lines[i])![1]);
        i++;
      }
      blocks.push({ kind: 'list', ordered: listRe === OL_RE, items });
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*```/.test(lines[i]) &&
      !HEADING_RE.test(lines[i]) &&
      !UL_RE.test(lines[i]) &&
      !OL_RE.test(lines[i])
    ) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push({ kind: 'paragraph', text: para.join(' ') });
  }
  return blocks;
}

export function MarkdownText({ source, className }: { source: string; className?: string }) {
  return (
    <div
      className={`markdown-text flex flex-col gap-2 text-[13px] leading-relaxed${className ? ` ${className}` : ''}`}
    >
      {parseBlocks(source).map((block, index) => {
        switch (block.kind) {
          case 'heading':
            return (
              <p key={index} className="m-0 font-semibold text-fg">
                {renderInline(block.text)}
              </p>
            );
          case 'code':
            return (
              <pre
                key={index}
                className="mono m-0 overflow-x-auto rounded-md bg-surface-secondary p-3 text-[12px]"
              >
                {block.text}
              </pre>
            );
          case 'list': {
            const items = block.items.map((item, j) => <li key={j}>{renderInline(item)}</li>);
            return block.ordered ? (
              <ol key={index} className="m-0 list-decimal pl-5">
                {items}
              </ol>
            ) : (
              <ul key={index} className="m-0 list-disc pl-5">
                {items}
              </ul>
            );
          }
          default:
            return (
              <p key={index} className="m-0">
                {renderInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
