import { ArrowRight, Building2, MapPin, ShieldCheck } from "lucide-react";
import { ContributionOpportunityCard } from "../components/ContributionOpportunityCard";
import { contributionOpportunities } from "../data/contribution-opportunities";

export function ContributionOpportunitiesPage() {
  return (
    <div className="opportunities-page" dir="rtl">
      <header className="opportunities-page-header">
        <a className="opportunities-page-brand" href="/" aria-label="العودة إلى صفحة عائد الرئيسية">
          <img src="/assets/aaid-logo.webp" alt="عائد" decoding="async" />
        </a>
        <span><MapPin size={15} aria-hidden="true" /> الفرص المتاحة في الرياض</span>
        <a className="opportunities-page-back" href="/"><ArrowRight size={15} aria-hidden="true" /> الرئيسية</a>
      </header>

      <main>
        <section className="opportunities-page-hero" aria-labelledby="all-opportunities-title">
          <div className="opportunities-page-hero-copy">
            <span><Building2 size={15} aria-hidden="true" /> فرص مساهمة موثوقة</span>
            <h1 id="all-opportunities-title">اختر أين يبدأ<br />أثرك في الرياض</h1>
            <p>فرص سكنية وبرامج دعم مختارة تجمع بين وضوح الهدف واستدامة الأثر مع متابعة نسبة التمويل في كل فرصة</p>
          </div>
          <aside>
            <ShieldCheck size={21} aria-hidden="true" />
            <div><strong>وضوح من أول مساهمة</strong><span>الأرقام المعروضة مستهدفة وتقديرية لهذا النموذج</span></div>
          </aside>
        </section>

        <section className="opportunities-catalog" aria-label="جميع فرص المساهمة في الرياض">
          <div className="opportunities-catalog-heading">
            <div><span>مدينة الرياض</span><h2>فرص المساهمة</h2></div>
            <p>{contributionOpportunities.length} فرص متاحة الآن</p>
          </div>
          <div className="contribution-cards contribution-cards--catalog">
            {contributionOpportunities.map((opportunity) => (
              <ContributionOpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </section>
      </main>

      <footer className="opportunities-page-footer">
        <span>© 2026 عائد نموذج واجهة تجريبي</span>
        <a href="/start">ابدأ مساهمتك</a>
      </footer>
    </div>
  );
}
