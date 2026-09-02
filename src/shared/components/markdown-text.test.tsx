import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownText } from './markdown-text';

describe('MarkdownText', () => {
  it('renders paragraphs, bare URLs and inline code', () => {
    render(
      <MarkdownText
        source={
          'Apache Trino provides a distributed SQL engine.\nAccess the UI at https://trino.demo.okdp.sandbox\n\nConnect with `trino --server`.'
        }
      />,
    );
    expect(screen.getByText(/distributed SQL engine/)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'https://trino.demo.okdp.sandbox' });
    expect(link).toHaveAttribute('href', 'https://trino.demo.okdp.sandbox');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('trino --server').tagName).toBe('CODE');
  });

  it('renders headings, lists, bold and fenced code', () => {
    const { container } = render(
      <MarkdownText
        source={'## Usage\n\n- **one**\n- two\n\n1. first\n2. second\n\n```\nkubectl get pods\n```'}
      />,
    );
    expect(screen.getByText('Usage')).toBeInTheDocument();
    expect(container.querySelectorAll('ul li')).toHaveLength(2);
    expect(container.querySelectorAll('ol li')).toHaveLength(2);
    expect(screen.getByText('one').tagName).toBe('STRONG');
    expect(container.querySelector('pre')?.textContent).toBe('kubectl get pods');
  });

  it('never renders markup or unsafe links from the source', () => {
    const { container } = render(
      <MarkdownText source={'<img src=x onerror=alert(1)> [click](javascript:alert(1))'} />,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('a')).toBeNull();
    expect(screen.getByText(/<img src=x/)).toBeInTheDocument();
  });

  it('keeps a titled link', () => {
    render(<MarkdownText source={'See [the docs](https://okdp.io/docs).'} />);
    expect(screen.getByRole('link', { name: 'the docs' })).toHaveAttribute(
      'href',
      'https://okdp.io/docs',
    );
  });
});
