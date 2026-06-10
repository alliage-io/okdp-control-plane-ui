// Placeholder — ported in a later roadmap step (see REACT-ROADMAP.md)
export interface ServicesPageProps {
  title: string;
  deployLabel: string;
  serviceFilter: string;
  emptyMessage: string;
}

export default function ServicesPage({ title }: ServicesPageProps) {
  return <div className="page-placeholder">{title} (migration in progress)</div>;
}
