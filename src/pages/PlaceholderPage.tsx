import { ArrowRight, Headphones } from "lucide-react";
import { useI18n } from "../i18n";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const { t } = useI18n();
  return (
    <div className="page page--centered">
      <section className="placeholder-panel">
        <span className="icon-tile"><Headphones aria-hidden="true" size={22} /></span>
        <p className="eyebrow">{t("stageOneCMajor")}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <button className="button button--primary" type="button">{t("ready")} <ArrowRight aria-hidden="true" size={17} /></button>
      </section>
    </div>
  );
}
