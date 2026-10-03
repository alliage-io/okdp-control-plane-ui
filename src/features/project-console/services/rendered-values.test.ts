import { describe, it, expect } from 'vitest';
import { buildRows, splitLines, tokenizeYamlLine } from './rendered-values';

const TEXT = Array.from({ length: 20 }, (_, i) => `k${i + 1}: v`).join('\n') + '\n';

describe('splitLines', () => {
  it('drops the final newline and reads an empty text as no line', () => {
    expect(splitLines('a: 1\nb: 2\n')).toEqual(['a: 1', 'b: 2']);
    expect(splitLines('')).toEqual([]);
  });
});

describe('buildRows', () => {
  it('shows every line, flagging the changed ones', () => {
    const rows = buildRows('a: 1\nb: 2\n', [2], false);
    expect(rows).toEqual([
      { kind: 'line', no: 1, text: 'a: 1', changed: false },
      { kind: 'line', no: 2, text: 'b: 2', changed: true },
    ]);
  });

  it('folds unchanged lines away from the changes, keeping a context', () => {
    const rows = buildRows(TEXT, [10], true);
    expect(rows[0]).toEqual({ kind: 'gap', from: 1, to: 6 });
    expect(rows.slice(1, 8).map((r) => (r.kind === 'line' ? r.no : -1))).toEqual([
      7, 8, 9, 10, 11, 12, 13,
    ]);
    expect(rows[8]).toEqual({ kind: 'gap', from: 14, to: 20 });
    expect(rows).toHaveLength(9);
  });

  it('merges close changes into one hunk and unfolds an expanded gap', () => {
    const rows = buildRows(TEXT, [5, 9], true, new Set([13]));
    // 2..12 kept (5±3, 9±3), 1 folded, 13..20 expanded.
    expect(rows[0]).toEqual({ kind: 'gap', from: 1, to: 1 });
    expect(rows.filter((r) => r.kind === 'gap')).toHaveLength(1);
    expect(rows).toHaveLength(1 + 19);
  });

  it('folds everything when nothing changed', () => {
    expect(buildRows(TEXT, [], true)).toEqual([{ kind: 'gap', from: 1, to: 20 }]);
  });
});

describe('tokenizeYamlLine', () => {
  const kinds = (line: string) => tokenizeYamlLine(line).map((t) => [t.kind, t.text]);

  it('colours keys and their scalar', () => {
    expect(kinds('  replicaCount: 3')).toEqual([
      ['indent', '  '],
      ['key', 'replicaCount'],
      ['punct', ':'],
      ['text', ' '],
      ['literal', '3'],
    ]);
    expect(kinds('image: "trinodb/trino"')).toEqual([
      ['key', 'image'],
      ['punct', ':'],
      ['text', ' '],
      ['string', '"trinodb/trino"'],
    ]);
  });

  it('reads list items, comments and block scalar indicators', () => {
    expect(kinds('- name: A')).toEqual([
      ['dash', '- '],
      ['key', 'name'],
      ['punct', ':'],
      ['text', ' '],
      ['text', 'A'],
    ]);
    expect(kinds('- 8080')).toEqual([
      ['dash', '-'],
      ['text', ' '],
      ['literal', '8080'],
    ]);
    expect(kinds('  # a comment')).toEqual([
      ['indent', '  '],
      ['comment', '# a comment'],
    ]);
    expect(kinds('config: |-')).toEqual([
      ['key', 'config'],
      ['punct', ':'],
      ['text', ' '],
      ['literal', '|-'],
    ]);
  });

  it('keeps a URL value whole and a plain line as text', () => {
    expect(kinds('url: https://x:8080/p')).toEqual([
      ['key', 'url'],
      ['punct', ':'],
      ['text', ' '],
      ['text', 'https://x:8080/p'],
    ]);
    expect(kinds('    connector.name=hive')).toEqual([['text', '    connector.name=hive']]);
  });
});
