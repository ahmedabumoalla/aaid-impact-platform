import { ArrowLeft, MapPin } from "lucide-react";
import type { ContributionOpportunity } from "../data/contribution-opportunities";
import "../pages/opportunities-showcase.css";

export function ContributionOpportunityCard({ opportunity }: { opportunity: ContributionOpportunity }) {
  return (
    <article className="contribution-card">
      <div className="contribution-card-image">
        <img src={opportunity.image} alt={opportunity.imageAlt} loading="lazy" />
        <span className={`contribution-status ${opportunity.status === "متاح" ? "is-available" : "is-funding"}`}>
          {opportunity.status}
        </span>
        <span className="contribution-location"><MapPin size={12} aria-hidden="true" /> {opportunity.district}</span>
      </div>
      <div className="contribution-card-body">
        <div>
          <h3>{opportunity.title}</h3>
          <p>{opportunity.subtitle}</p>
        </div>
        <div className="contribution-progress-copy">
          <span>تم جمع <strong>{opportunity.funded}%</strong></span>
          <span>الهدف <strong>{opportunity.target} ر.س</strong></span>
        </div>
        <div
          className="contribution-progress"
          role="progressbar"
          aria-label={`نسبة تمويل ${opportunity.title}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={opportunity.funded}
        >
          <i style={{ width: `${opportunity.funded}%` }} />
        </div>
        <a href={`/start?opportunity=${encodeURIComponent(opportunity.id)}`} aria-label={`ساهم الآن في ${opportunity.title}`}>
          ساهم الآن <ArrowLeft size={15} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
