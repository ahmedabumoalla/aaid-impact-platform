import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Clock3,
  Home,
  Leaf,
  Recycle,
  Sprout,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { loadDemoState } from "../lib/demo-storage";
import { formatSar } from "../lib/impact";
import "./investor-entry.css";

export function InvestorEntry() {
  const contributions = loadDemoState().contributions;
  const total = contributions.reduce((sum, item) => sum + item.amount, 0);
  const latestContribution = contributions[0];
  const families = Math.max(0, Math.round(total / 3_500));
  const emissions = Math.max(0, Math.round(total / 850));
  const growthAmount = Math.max(total, 5_000);
  const futureFamilies = families + Math.max(2, Math.round(growthAmount / 2_500));
  const hasImpact = total > 0;

  return (
    <div className="investor-entry" dir="rtl">
      <header className="entry-header">
        <a className="entry-brand" href="/" aria-label="العودة إلى عائد"><img src="/assets/aaid-logo.webp" alt="عائد" decoding="async" /></a>
        <a className="entry-back" href="/"><ArrowRight size={17} /> العودة</a>
      </header>

      <main className="entry-main">
        <section className="entry-hero" aria-labelledby="entry-title">
          <div className="entry-hero-copy">
            <span>{hasImpact ? "أثرك مستمر" : "فرصتك تبدأ الآن"}</span>
            <h1 id="entry-title">أنت تصنع فرقًا<br /><em>والفرصة مستمرة</em></h1>
            <p>{hasImpact ? "مساهماتك السابقة صنعت أثرًا ويمكنك اليوم تنمية مساهمتك لتصل إلى أسر أكثر" : "ابدأ مساهمتك الأولى وابن أثرًا ينمو مع الوقت ويصل إلى أسر أكثر"}</p>
          </div>
          <div className="entry-growth-visual" aria-hidden="true">
            <span className="growth-arrow"><TrendingUp size={26} /></span>
            <img src="/assets/aaid-impact-sprout.webp" alt="" loading="lazy" decoding="async" />
            <div className="growth-blocks"><span>أثر أكبر</span><span>عائد مستدام</span><span>استدامة العطاء</span></div>
          </div>
        </section>

        <section className="entry-impact" aria-labelledby="entry-impact-title">
          <div className="entry-section-heading"><span><BarChart3 size={19} /></span><div><h2 id="entry-impact-title">أثرك حتى الآن</h2><p>{latestContribution ? latestContribution.opportunityTitle : "ابدأ أول مساهمة لتظهر نتائج أثرك هنا"}</p></div></div>
          <div className="entry-impact-grid">
            <div><Home size={23} /><strong>{families}</strong><span>أسر مستفيدة</span></div>
            <div><Leaf size={23} /><strong>{emissions} طن</strong><span>انخفاض الانبعاثات سنويًا</span></div>
            <div><TrendingUp size={23} /><strong>{hasImpact ? "8%" : "0%"}</strong><span>عائد اجتماعي متوقع سنويًا</span></div>
            <div><WalletCards size={23} /><strong>{formatSar(total)}</strong><span>قيمة مساهماتك</span></div>
          </div>
        </section>

        <section className="entry-growth" aria-labelledby="entry-growth-title">
          <div className="entry-growth-copy">
            <span><Sprout size={22} /></span>
            <div><h2 id="entry-growth-title">ماذا لو زدت مساهمتك</h2><p>محاكاة سريعة توضح كيف يمكن لأثرك أن ينمو مع مساهمة جديدة</p></div>
          </div>
          <div className="growth-comparison" aria-label="مقارنة الأثر الحالي بالأثر المتوقع">
            <div><strong>{families} أسر</strong><i><b style={{ height: "45%" }} /></i><span>أثرك الحالي</span><small>{formatSar(total)}</small></div>
            <div className="is-future"><strong>{futureFamilies} أسر</strong><i><b style={{ height: "82%" }} /></i><span>بعد زيادة المساهمة</span><small>{formatSar(total + growthAmount)}</small></div>
          </div>
          <aside><Leaf size={24} /><div><strong>فرصة لمزيد من الأثر</strong><p>زيادة مساهمتك تمنح المشروع قدرة أكبر للوصول إلى الأسر وتسريع تنفيذ الوحدات السكنية</p></div></aside>
        </section>

        <section className="entry-benefits" aria-labelledby="entry-benefits-title">
          <h2 id="entry-benefits-title">مزايا الاستمرارية</h2>
          <div>
            <span><Clock3 size={22} /><strong>استدامة الدعم</strong><small>للمشاريع السكنية</small></span>
            <span><BarChart3 size={22} /><strong>عائد اجتماعي</strong><small>مستمر وقابل للقياس</small></span>
            <span><Leaf size={22} /><strong>أثر بيئي أكبر</strong><small>مع كل مساهمة</small></span>
            <span><Users size={22} /><strong>مشاركة مجتمعية</strong><small>تصل إلى أسر أكثر</small></span>
          </div>
        </section>

        <section className="entry-actions" aria-labelledby="entry-actions-title">
          <div><Sprout size={24} /><div><h2 id="entry-actions-title">نم أثرك الآن</h2><p>اختر فرصة جديدة ووسع أثر مساهمتك في مدينة الرياض</p></div></div>
          <div><a className="entry-primary" href="/opportunities">نم أثرك الآن <ArrowLeft size={17} /></a><a className="entry-later" href="/investor/dashboard">لاحقًا</a></div>
        </section>

        <footer className="entry-sustainability"><Recycle size={24} /><div><strong>معًا نبني أثرًا مستدامًا</strong><p>كل مساهمة اليوم تصنع مستقبلًا أفضل للأسر والمجتمع</p></div></footer>
      </main>
    </div>
  );
}
