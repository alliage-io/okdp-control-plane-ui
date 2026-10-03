/** Lines of a values.yaml, the way the rendered-values viewer shows them. */

export type ValuesRow =
  | { kind: 'line'; no: number; text: string; changed: boolean }
  /** A run of unchanged lines folded away, `from`..`to` (1-based, inclusive). */
  | { kind: 'gap'; from: number; to: number };

/** Unchanged lines kept around each change in "changes only" mode, like the
 *  context of a git hunk. */
export const HUNK_CONTEXT = 3;

export function splitLines(text: string): string[] {
  const lines = text.replace(/\n$/, '').split('\n');
  return lines.length === 1 && lines[0] === '' ? [] : lines;
}

/**
 * The rows to show for `text`. With `changesOnly`, unchanged lines further
 * than `context` lines from a change fold into gaps, except the gaps the user
 * expanded (keyed by their first line).
 */
export function buildRows(
  text: string,
  changedLines: readonly number[],
  changesOnly: boolean,
  expanded: ReadonlySet<number> = new Set(),
  context = HUNK_CONTEXT,
): ValuesRow[] {
  const lines = splitLines(text);
  const changed = new Set(changedLines);
  const all = lines.map(
    (line, i): ValuesRow => ({ kind: 'line', no: i + 1, text: line, changed: changed.has(i + 1) }),
  );
  if (!changesOnly) return all;

  const keep = new Array<boolean>(lines.length + 2).fill(false);
  for (const no of changed) {
    for (let l = Math.max(1, no - context); l <= Math.min(lines.length, no + context); l++) {
      keep[l] = true;
    }
  }
  const rows: ValuesRow[] = [];
  let no = 1;
  while (no <= lines.length) {
    if (keep[no]) {
      rows.push(all[no - 1]);
      no++;
      continue;
    }
    const from = no;
    while (no <= lines.length && !keep[no]) no++;
    if (expanded.has(from)) {
      rows.push(...all.slice(from - 1, no - 1));
    } else {
      rows.push({ kind: 'gap', from, to: no - 1 });
    }
  }
  return rows;
}

export type YamlTokenKind =
  | 'indent'
  | 'dash'
  | 'key'
  | 'punct'
  | 'string'
  | 'literal'
  | 'comment'
  | 'text';

export interface YamlToken {
  kind: YamlTokenKind;
  text: string;
}

const COMMENT = /^(\s*)(#.*)$/;
// indent, optional "- ", key (plain or quoted), ":" then the rest.
const KEY_LINE = /^(\s*)(-\s+)?("(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^\s#'"{[][^:#]*?):(?=\s|$)(.*)$/;
const ITEM_LINE = /^(\s*)(-)(\s.*|)$/;
const LITERAL = /^(?:true|false|null|~|-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?|[|>][-+]?\d*)$/;

function valueTokens(value: string): YamlToken[] {
  const lead = value.match(/^\s*/)?.[0] ?? '';
  const body = value.slice(lead.length);
  const tokens: YamlToken[] = lead ? [{ kind: 'text', text: lead }] : [];
  if (!body) return tokens;
  if (body.startsWith('#')) return [...tokens, { kind: 'comment', text: body }];
  if (/^["']/.test(body)) return [...tokens, { kind: 'string', text: body }];
  if (LITERAL.test(body)) return [...tokens, { kind: 'literal', text: body }];
  return [...tokens, { kind: 'text', text: body }];
}

/** A light YAML colouring of one line: keys, scalars, comments. Block
 *  scalar contents (under `key: |`) are plain lines, coloured as text. */
export function tokenizeYamlLine(line: string): YamlToken[] {
  const comment = line.match(COMMENT);
  if (comment) {
    return [
      ...(comment[1] ? [{ kind: 'indent' as const, text: comment[1] }] : []),
      { kind: 'comment', text: comment[2] },
    ];
  }
  const key = line.match(KEY_LINE);
  if (key) {
    const [, indent, dash, name, rest] = key;
    return [
      ...(indent ? [{ kind: 'indent' as const, text: indent }] : []),
      ...(dash ? [{ kind: 'dash' as const, text: dash }] : []),
      { kind: 'key', text: name },
      { kind: 'punct', text: ':' },
      ...valueTokens(rest),
    ];
  }
  const item = line.match(ITEM_LINE);
  if (item) {
    const [, indent, dash, rest] = item;
    return [
      ...(indent ? [{ kind: 'indent' as const, text: indent }] : []),
      { kind: 'dash', text: dash },
      ...valueTokens(rest),
    ];
  }
  return line ? [{ kind: 'text', text: line }] : [];
}
