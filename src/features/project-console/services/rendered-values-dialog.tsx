import { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import EmptyState from '../../../shared/components/empty-state';
import { serviceApi } from '../../../core/api/service-api';
import type { RenderedValues } from '../../../core/models/service.model';
import { apiErrorMessage } from './service-utils';
import { buildRows, splitLines, tokenizeYamlLine, type ValuesRow } from './rendered-values';

type View = 'rendered' | 'defaults';

export interface RenderedValuesDialogProps {
  projectId: string;
  /** The instance; the dialog is shown while it is set. */
  serviceName: string | null;
  onHide: () => void;
}

function YamlLine({ text }: { text: string }) {
  return (
    <>
      {tokenizeYamlLine(text).map((token, i) => (
        <span key={i} className={`rv-tok-${token.kind}`}>
          {token.text}
        </span>
      ))}
    </>
  );
}

function ValuesCode({ rows, onExpand }: { rows: ValuesRow[]; onExpand: (from: number) => void }) {
  return (
    <div className="rv-code" role="table" aria-label="values.yaml">
      {rows.map((row) =>
        row.kind === 'gap' ? (
          <button
            key={`gap-${row.from}`}
            type="button"
            className="rv-gap"
            onClick={() => onExpand(row.from)}
            title="Show these lines"
          >
            <i className="pi pi-arrows-v" />
            {row.to - row.from + 1} unchanged line{row.to === row.from ? '' : 's'}
          </button>
        ) : (
          <div
            key={row.no}
            role="row"
            className={row.changed ? 'rv-line rv-changed' : 'rv-line'}
            data-line={row.no}
          >
            <span className="rv-no" role="cell">
              {row.no}
            </span>
            <span className="rv-mark" role="cell" aria-label={row.changed ? 'changed' : undefined}>
              {row.changed ? '+' : ''}
            </span>
            <span className="rv-text" role="cell">
              <YamlLine text={row.text} />
            </span>
          </div>
        ),
      )}
    </div>
  );
}

/**
 * The values each upstream chart vendored by an instance's chart was rendered
 * with (the "final values.yaml" a plain Helm install would have taken), with
 * the lines that differ from the chart's own defaults highlighted, git style.
 */
export function RenderedValuesDialog({
  projectId,
  serviceName,
  onHide,
}: RenderedValuesDialogProps) {
  const [renders, setRenders] = useState<RenderedValues[] | null>(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('');
  const [view, setView] = useState<View>('rendered');
  const [changesOnly, setChangesOnly] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!serviceName) return;
    let cancelled = false;
    setRenders(null);
    setError('');
    setView('rendered');
    setChangesOnly(false);
    serviceApi
      .getRenderedValues(projectId, serviceName)
      .then((data) => {
        if (cancelled) return;
        setRenders(data);
        setSelected(data[0]?.name ?? '');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(apiErrorMessage(err, 'Failed to load the rendered values'));
        setRenders([]);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, serviceName]);

  const current = renders?.find((r) => r.name === selected) ?? renders?.[0];

  // A new render, view or mode starts folded again.
  useEffect(() => {
    setExpanded(new Set());
    setCopied(false);
  }, [selected, view, changesOnly]);

  const text = current ? (view === 'rendered' ? current.values : (current.defaults ?? '')) : '';
  const highlights = useMemo(
    () => (view === 'rendered' && current ? current.changedLines : []),
    [view, current],
  );
  const rows = useMemo(
    () => buildRows(text, highlights, view === 'rendered' && changesOnly, expanded),
    [text, highlights, view, changesOnly, expanded],
  );
  const lineCount = useMemo(() => splitLines(text).length, [text]);
  const hasDefaults = !!current?.defaults;
  const changed = current?.changedLines.length ?? 0;

  const copy = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  const download = () => {
    if (!current) return;
    const blob = new Blob([text], { type: 'application/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download =
      view === 'rendered' ? `${current.name}.yaml` : `${current.chartVersion}-defaults.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      header={
        <span className="inline-flex items-center gap-2">
          <i className="pi pi-code text-primary"></i>
          Rendered values
          <span className="text-[12px] font-normal text-fg-secondary">{serviceName}</span>
        </span>
      }
      visible={!!serviceName}
      onHide={onHide}
      style={{ width: '64rem', maxWidth: '95vw' }}
      contentClassName="rv-dialog-content"
      dismissableMask
    >
      {renders === null ? (
        <EmptyState
          variant="panel"
          icon="pi pi-spin pi-spinner"
          title="Loading the rendered values…"
        />
      ) : error ? (
        <div className="alert alert-danger">
          <i className="pi pi-exclamation-circle"></i>
          <div>
            <strong>Could not load the rendered values</strong>
            <p className="mono">{error}</p>
          </div>
        </div>
      ) : !current ? (
        <EmptyState
          variant="panel"
          icon="pi pi-file"
          title="No rendered values"
          description="This instance's chart renders no vendored upstream chart, or was built before the charts published their rendered values."
        />
      ) : (
        <>
          <p className="mb-3 text-[13px] text-fg-secondary">
            The <span className="mono">values.yaml</span> each upstream chart received, as a plain{' '}
            <span className="mono">helm install</span> would take it. Lines in green differ from the
            chart&apos;s own defaults: computed by the platform, or set on this instance.
          </p>

          {renders.length > 1 && (
            <div className="okdp-tabs" role="tablist">
              {renders.map((r) => (
                <button
                  key={r.name}
                  role="tab"
                  aria-selected={r.name === current.name}
                  className={r.name === current.name ? 'okdp-tab active' : 'okdp-tab'}
                  onClick={() => setSelected(r.name)}
                  title={r.name}
                >
                  {r.chart}
                  {r.changedLines.length > 0 && (
                    <span className="rv-count">+{r.changedLines.length}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="rv-toolbar">
            <div className="rv-meta">
              <span className="version-badge mono">{current.chartVersion || current.chart}</span>
              <span className="muted-text small mono">{current.name}</span>
            </div>
            <div className="rv-actions">
              <div className="rv-segmented" role="group" aria-label="File">
                <button
                  className={view === 'rendered' ? 'active' : ''}
                  aria-pressed={view === 'rendered'}
                  onClick={() => setView('rendered')}
                >
                  Rendered
                </button>
                <button
                  className={view === 'defaults' ? 'active' : ''}
                  aria-pressed={view === 'defaults'}
                  disabled={!hasDefaults}
                  onClick={() => setView('defaults')}
                  title={hasDefaults ? 'The chart’s own values.yaml' : current.defaultsError}
                >
                  Chart defaults
                </button>
              </div>
              <button
                className={`rv-toggle${changesOnly ? ' active' : ''}`}
                aria-pressed={changesOnly}
                disabled={view !== 'rendered' || !hasDefaults}
                onClick={() => setChangesOnly((v) => !v)}
                title="Fold the lines that match the chart defaults"
              >
                <i className="pi pi-filter"></i>
                Changes only
              </button>
              <button className="icon-btn" title={copied ? 'Copied' : 'Copy'} onClick={copy}>
                <i className={copied ? 'pi pi-check' : 'pi pi-copy'}></i>
              </button>
              <button className="icon-btn" title="Download" onClick={download}>
                <i className="pi pi-download"></i>
              </button>
            </div>
          </div>

          {view === 'rendered' && current.defaultsError && (
            <div className="alert alert-warn">
              <i className="pi pi-info-circle"></i>
              <div>
                <strong>Differences with the chart defaults are not shown</strong>
                <p className="mono">{current.defaultsError}</p>
              </div>
            </div>
          )}

          <div className="rv-frame">
            <div className="rv-frame-head">
              <span className="mono">
                {view === 'rendered' ? 'values.yaml' : `vendor/${current.chart}/values.yaml`}
              </span>
              <span className="muted-text small">
                {lineCount} lines
                {view === 'rendered' && hasDefaults && (
                  <>
                    {' · '}
                    <span className="rv-legend">
                      <span className="rv-swatch" /> {changed} differ from the defaults
                    </span>
                  </>
                )}
              </span>
            </div>
            <ValuesCode
              rows={rows}
              onExpand={(from) => setExpanded((prev) => new Set(prev).add(from))}
            />
          </div>
        </>
      )}
    </Dialog>
  );
}
