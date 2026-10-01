import { ArrowRight, Headphones } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="page page--centered">
      <section className="placeholder-panel">
        <span className="icon-tile"><Headphones aria-hidden="true" size={22} /></span>
        <p className="eyebrow">第一阶段 · C 大调</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <button className="button button--primary" type="button">准备好了 <ArrowRight aria-hidden="true" size={17} /></button>
      </section>
    </div>
  );
}
