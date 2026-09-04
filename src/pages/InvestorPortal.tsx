"use client";

import { FormEvent, lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  BrainCircuit,
  Building2,
  Check,
  ChevronLeft,
  CircleDollarSign,
  Clock3,
  Home,
  LayoutDashboard,
  Leaf,
  LineChart,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { contributionOpportunities, type ContributionOpportunity } from "../data/contribution-opportunities";
import { loadDemoState, recordDemoContribution, type DemoContribution } from "../lib/demo-storage";
import { motionTokens, springs } from "../lib/motion-tokens";
import "./investor-portal.css";

const ImpactUniverse = lazy(() => import("../components/ImpactUniverse").then((module) => ({ default: module.ImpactUniverse })));

export type InvestorPortalPage = "overview" | "wallet" | "analysis";

type Position = {
  opportunity: ContributionOpportunity;
  amount: number;
  contributions: number;
  lastDate: string;
};

const pageMeta = {
  overview: { label: "نظرة عامة", href: "/investor/dashboard", icon: LayoutDashboard },
  wallet: { label: "المحفظة", href: "/wallet", icon: WalletCards },
  analysis: { label: "تحليل عائد AI", href: "/analysis", icon: BrainCircuit },
} satisfies Record<InvestorPortalPage, { label: string; href: string; icon: typeof LayoutDashboard }>;

function money(value: number) {
  return `${new Intl.NumberFormat("ar-SA", { useGrouping: false, maximumFractionDigits: 0 }).format(value)} ريال`;
}

function cleanDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "اليوم";
  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date).replace(/[،,.]/g, "");
}

function buildPositions(contributions: DemoContribution[]) {
  return contributionOpportunities.flatMap((opportunity) => {
    const items = contributions.filter((item) => item.opportunityId === opportunity.id || item.opportunityTitle === opportunity.title);
    if (!items.length) return [];
    return [{
      opportunity,
      amount: items.reduce((sum, item) => sum + item.amount, 0),
      contributions: items.length,
      lastDate: items[0].createdAt,
    }];
  });
}

function PortalNav({ page }: { page: InvestorPortalPage }) {
  return (
    <nav className="ip-nav" aria-label="أقسام مساحة المستثمر">
      {(Object.keys(pageMeta) as InvestorPortalPage[]).map((key) => {
        const item = pageMeta[key];
        const Icon = item.icon;
        return (
          <a key={key} href={item.href} className={page === key ? "is-active" : ""} aria-current={page === key ? "page" : undefined}>
            <Icon size={20} aria-hidden="true" />
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

function PortalHeader({ page }: { page: InvestorPortalPage }) {
  return (
    <header className="ip-header">
      <a className="ip-brand" href="/" aria-label="العودة إلى منصة عائد">
        <img src="/assets/aaid-logo.png" alt="عائد" />
      </a>
      <div className="ip-search">
        <Search size={18} aria-hidden="true" />
        <span>ابحث في محفظتك وفرصك</span>
        <kbd>⌘ K</kbd>
      </div>
      <div className="ip-header-actions">
        <button type="button" aria-label="التنبيهات"><Bell size={19} /></button>
        <span className="ip-investor-mark">م ع</span>
        <div><strong>مستثمر عائد</strong><small>{pageMeta[page].label}</small></div>
      </div>
    </header>
  );
}

function SuggestedOpportunity({ opportunity }: { opportunity: ContributionOpportunity }) {
  return (
    <article className="ip-suggestion">
      <img src={opportunity.image} alt={opportunity.imageAlt} />
      <div className="ip-suggestion-copy">
        <span className="ip-eyebrow"><Sparkles size={15} /> فرصة مقترحة لك</span>
        <h2>{opportunity.title}</h2>
        <p>اختيار مناسب لتوسيع توزيع محفظتك داخل مدينة الرياض ورفع تنوع الأثر السكني</p>
        <div className="ip-suggestion-facts">
          <span><Target size={16} /> تم جمع {opportunity.funded}٪</span>
          <span><Home size={16} /> {opportunity.district}</span>
        </div>
      </div>
      <a href={`/start?opportunity=${encodeURIComponent(opportunity.id)}`}>ساهم في الفرصة <ArrowLeft size={18} /></a>
    </article>
  );
}

function PositionCard({ position, total }: { position: Position; total: number }) {
  const share = total ? Math.round(position.amount / total * 100) : 0;
  return (
    <article className="ip-position-card">
      <div className="ip-position-image">
        <img src={position.opportunity.image} alt={position.opportunity.imageAlt} />
        <span>{position.opportunity.district}</span>
      </div>
      <div className="ip-position-body">
        <small>فرصة نشطة</small>
        <h3>{position.opportunity.title}</h3>
        <p>{position.opportunity.subtitle}</p>
        <div className="ip-position-value"><span>إجمالي مساهمتك</span><strong>{money(position.amount)}</strong></div>
        <div className="ip-progress" aria-label={`تم جمع ${position.opportunity.funded} بالمئة`}><i style={{ width: `${position.opportunity.funded}%` }} /></div>
        <div className="ip-position-meta"><span>{position.contributions} مساهمة</span><span>{share}٪ من المحفظة</span><span>{cleanDate(position.lastDate)}</span></div>
      </div>
    </article>
  );
}

function EmptyPortfolio() {
  return (
    <div className="ip-empty">
      <span><Building2 size={28} /></span>
      <h3>محفظتك جاهزة لأول مساهمة</h3>
      <p>اختر فرصة من مدينة الرياض وابدأ بناء أثر يمكن متابعته من هنا</p>
      <a href="/opportunities">استعرض الفرص <ArrowLeft size={17} /></a>
    </div>
  );
}

function Overview({ contributions, positions, total, suggestion }: PortalData) {
  const families = Math.max(0, Math.round(total / 3500));
  const returnValue = Math.round(total * 0.08);
  return (
    <>
      <section className="ip-page-intro">
        <div><span className="ip-live"><i /> بيانات محفظتك محدثة</span><h1>مرحبًا بك مستثمر عائد</h1><p>هنا ترى قيمة مساهماتك وما تصنعه من أثر في مكان واحد</p></div>
        <a href="/opportunities">مساهمة جديدة <ArrowLeft size={18} /></a>
      </section>

      <section className="ip-hero-summary">
        <div className="ip-balance-panel">
          <span>قيمة المحفظة الحالية</span>
          <strong>{money(total)}</strong>
          <small><TrendingUp size={15} /> أثر تقديري متنام مع كل مساهمة</small>
          <div className="ip-mini-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
        </div>
        <div className="ip-impact-panel">
          <div><span className="ip-icon mint"><Users size={21} /></span><small>أسر يصل إليها الأثر</small><strong>{families}</strong></div>
          <div><span className="ip-icon blue"><CircleDollarSign size={21} /></span><small>عائد اجتماعي تقديري</small><strong>{money(returnValue)}</strong></div>
          <div><span className="ip-icon cyan"><Building2 size={21} /></span><small>فرص نشطة</small><strong>{positions.length}</strong></div>
        </div>
      </section>

      <SuggestedOpportunity opportunity={suggestion} />

      <section className="ip-section" aria-labelledby="positions-title">
        <div className="ip-section-heading"><div><span>محفظتك الحالية</span><h2 id="positions-title">فرص ساهمت فيها</h2></div><a href="/wallet">إدارة المحفظة <ChevronLeft size={17} /></a></div>
        {positions.length ? <div className="ip-position-grid">{positions.map((position) => <PositionCard key={position.opportunity.id} position={position} total={total} />)}</div> : <EmptyPortfolio />}
      </section>

      <section className="ip-activity" aria-labelledby="activity-title">
        <div className="ip-section-heading"><div><span>سجل واضح</span><h2 id="activity-title">آخر نشاط</h2></div></div>
        {contributions.length ? contributions.slice(0, 4).map((item) => <div className="ip-activity-row" key={item.id}><span className="ip-icon soft"><Check size={18} /></span><div><strong>مساهمة مكتملة</strong><small>{item.opportunityTitle}</small></div><time>{cleanDate(item.createdAt)}</time><b>{money(item.amount)}</b></div>) : <p className="ip-muted">لا توجد مساهمات مسجلة حتى الآن</p>}
      </section>
    </>
  );
}

type PortalData = {
  contributions: DemoContribution[];
  positions: Position[];
  total: number;
  suggestion: ContributionOpportunity;
};

function WalletPage({ contributions, positions, total, suggestion, onAdded }: PortalData & { onAdded: () => void }) {
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [opportunityId, setOpportunityId] = useState(positions[0]?.opportunity.id ?? suggestion.id);
  const [message, setMessage] = useState("");
  const chosenAmount = customAmount ? Number(customAmount) : amount;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!Number.isFinite(chosenAmount) || chosenAmount < 100) {
      setMessage("أدخل مبلغًا يبدأ من 100 ريال");
      return;
    }
    const opportunity = contributionOpportunities.find((item) => item.id === opportunityId) ?? suggestion;
    recordDemoContribution({
      id: `wallet-${Date.now()}`,
      amount: chosenAmount,
      opportunityId: opportunity.id,
      opportunityTitle: opportunity.title,
      pathId: "wallet-growth",
      pathTitle: "تنمية المحفظة",
      createdAt: new Date().toISOString(),
    });
    setMessage(`تمت إضافة ${money(chosenAmount)} إلى محفظتك التجريبية`);
    setCustomAmount("");
    onAdded();
  }

  return (
    <>
      <section className="ip-page-intro compact"><div><span className="ip-live"><i /> المحفظة جاهزة</span><h1>محفظة مستثمر عائد</h1><p>تحكم في مساهماتك وتابع توزيع المبالغ بوضوح</p></div></section>
      <section className="ip-wallet-layout">
        <div className="ip-wallet-card">
          <div className="ip-wallet-card-top"><span><WalletCards size={21} /> الرصيد المساهم</span><ShieldCheck size={22} /></div>
          <strong>{money(total)}</strong>
          <p>موزع على {positions.length} فرص نشطة داخل مدينة الرياض</p>
          <div className="ip-wallet-stat-row"><span><small>عدد العمليات</small><b>{contributions.length}</b></span><span><small>متوسط المساهمة</small><b>{money(contributions.length ? total / contributions.length : 0)}</b></span></div>
        </div>
        <form className="ip-topup" onSubmit={submit}>
          <div className="ip-section-heading"><div><span>خطوة مرنة</span><h2>أضف مبلغًا للمحفظة</h2></div><span className="ip-icon cyan"><Plus size={20} /></span></div>
          <label htmlFor="wallet-opportunity">اختر الفرصة</label>
          <select id="wallet-opportunity" value={opportunityId} onChange={(event) => setOpportunityId(event.target.value)}>{contributionOpportunities.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
          <fieldset><legend>اختر المبلغ</legend><div className="ip-amount-options">{[500, 1000, 5000, 10000].map((value) => <button type="button" className={!customAmount && amount === value ? "is-selected" : ""} onClick={() => { setAmount(value); setCustomAmount(""); }} key={value}>{money(value)}</button>)}</div></fieldset>
          <label htmlFor="wallet-custom">أو أدخل مبلغًا آخر</label>
          <div className="ip-custom-amount"><input id="wallet-custom" inputMode="numeric" type="number" min="100" step="100" value={customAmount} placeholder="أدخل المبلغ" onChange={(event) => setCustomAmount(event.target.value)} /><span>ريال</span></div>
          <button className="ip-submit" type="submit">إضافة إلى المحفظة <ArrowLeft size={18} /></button>
          <p className="ip-demo-note">تجربة محلية لا يتم فيها خصم أي مبلغ</p>
          <p className="ip-form-status" aria-live="polite">{message}</p>
        </form>
      </section>
      <section className="ip-section"><div className="ip-section-heading"><div><span>توزيع ذكي</span><h2>تفاصيل المحفظة</h2></div></div>{positions.length ? <div className="ip-allocation-list">{positions.map((position) => { const share = total ? Math.round(position.amount / total * 100) : 0; return <div key={position.opportunity.id}><img src={position.opportunity.image} alt="" /><div><strong>{position.opportunity.title}</strong><small>{position.contributions} مساهمة</small><span className="ip-progress"><i style={{ width: `${share}%` }} /></span></div><b>{money(position.amount)}</b><em>{share}٪</em></div>; })}</div> : <EmptyPortfolio />}</section>
    </>
  );
}

function AnalysisPage({ positions, total, suggestion }: PortalData) {
  const [status, setStatus] = useState<"ready" | "analyzing" | "complete">("ready");
  const [analysisStage, setAnalysisStage] = useState(0);
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState !== "hidden");
  const [engineReady, setEngineReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [previousScore, setPreviousScore] = useState(() => Number(window.localStorage.getItem("aaid-last-analysis-score")) || 0);
  const reduceMotion = useReducedMotion();
  const largest = positions.length ? Math.max(...positions.map((item) => item.amount)) : 0;
  const concentration = total ? Math.round(largest / total * 100) : 0;
  const diversity = Math.min(96, positions.length ? 58 + positions.length * 11 : 35);
  const impact = Math.min(97, total ? 59 + Math.floor(total / 500) : 42);
  const amountSteps = Math.min(22, Math.floor(total / 500));
  const concentrationPenalty = Math.round(Math.max(0, concentration - 50) * 0.16);
  const overall = Math.min(97, Math.max(35, 61 + positions.length * 4 + amountSteps - concentrationPenalty));
  const scoreDelta = previousScore ? overall - previousScore : 0;

  useEffect(() => {
    const handleVisibility = () => setPageVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    let mounted = true;
    void import("../components/ImpactUniverse").then(() => {
      if (mounted) setEngineReady(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (status !== "analyzing" || !engineReady || !sceneReady) return;
    setAnalysisStage(0);
    const stageOne = window.setTimeout(() => setAnalysisStage(1), reduceMotion ? 100 : 850);
    const stageTwo = window.setTimeout(() => setAnalysisStage(2), reduceMotion ? 200 : 1800);
    const stageThree = window.setTimeout(() => setAnalysisStage(3), reduceMotion ? 300 : 2850);
    const complete = window.setTimeout(() => {
      setStatus("complete");
      window.localStorage.setItem("aaid-last-analysis-score", String(overall));
    }, reduceMotion ? 450 : 4300);
    return () => [stageOne, stageTwo, stageThree, complete].forEach(window.clearTimeout);
  }, [status, overall, reduceMotion, engineReady, sceneReady]);
  const recommendation = positions.length < 3 ? "توسيع المحفظة إلى ثلاث فرص يرفع التوازن ويمنح الأثر نطاقًا أكبر" : concentration > 55 ? "خفض التركيز في أكبر فرصة يمنح المحفظة مرونة أعلى" : "محفظتك متوازنة وأفضل خطوة تالية هي زيادة المساهمة تدريجيًا";
  const startAnalysis = () => {
    setPreviousScore(Number(window.localStorage.getItem("aaid-last-analysis-score")) || 0);
    setSceneReady(false);
    setStatus("analyzing");
  };
  return (
    <>
      <section className="ip-page-intro compact"><div><span className="ip-live"><i /> محرك عائد جاهز</span><h1>تحليل عائد AI</h1><p>قراءة ذكية مبنية على بيانات محفظتك الحالية</p></div><button className="ip-analysis-button" type="button" onClick={startAnalysis} disabled={status === "analyzing"}><BrainCircuit size={18} /> {status === "analyzing" ? "يتم التحليل الآن" : "تشغيل تحليل جديد"}</button></section>
      <AnimatePresence mode="wait">
      {status === "analyzing" ? <motion.section key="analyzing" className={`ip-analyzing ${pageVisible ? "" : "is-paused"}`} aria-live="polite" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: motionTokens.duration.fast }}>
        <div className="ip-neural-scene" aria-hidden="true">
          <div className="ip-universe-halo" />
          <Suspense fallback={<div className="ip-universe-loader"><span /></div>}>
            <ImpactUniverse activeIndex={analysisStage} speed={24} globeOnly onReady={() => setSceneReady(true)} />
          </Suspense>
          <div className="ip-fast-stream stream-one"><i /><i /><i /><i /></div>
          <div className="ip-fast-stream stream-two"><i /><i /><i /></div>
          <div className="ip-fast-stream stream-three"><i /><i /><i /><i /><i /></div>
          <div className="ip-fast-stream stream-four"><i /><i /><i /></div>
          <span className="ip-data-chip chip-total"><small>قيمة المحفظة</small><b>{money(total)}</b></span>
          <span className="ip-data-chip chip-opportunities"><small>الفرص النشطة</small><b>{positions.length}</b></span>
          <span className="ip-data-chip chip-signals"><small>إشارات تم فحصها</small><b>{24 + positions.length * 6}</b></span>
          <span className="ip-data-chip chip-impact"><small>مؤشر الأثر</small><b>{impact}</b></span>
        </div>
        <div className="ip-analysis-status">
          <span className="ip-eyebrow"><Sparkles size={15} /> تحليل مباشر لمحفظتك</span>
          <h2>{["نربط بيانات مساهماتك", "نقيس التوازن والتركيز", "نحاكي نمو الأثر", "نبني توصيتك الذكية"][analysisStage]}</h2>
          <div className="ip-analysis-progress"><motion.i initial={{ scaleX: .05 }} animate={{ scaleX: (analysisStage + 1) / 4 }} transition={springs.gentle} /></div>
          <div className="ip-analysis-steps">{["قراءة المحفظة", "قياس التوزيع", "محاكاة الأثر", "صياغة التوصية"].map((label, index) => <span className={index < analysisStage ? "is-done" : index === analysisStage ? "is-active" : ""} key={label}><i>{index < analysisStage ? <Check size={13} /> : index + 1}</i>{label}</span>)}</div>
          <small>تتم المعالجة محليًا داخل تجربة عائد</small>
        </div>
      </motion.section> : <motion.div key="results" className="ip-analysis-results" initial={{ opacity: 1 }} animate={{ opacity: 1 }} transition={{ duration: motionTokens.duration.normal }}>
        <section className="ip-analysis-hero">
          <div className="ip-score" style={{ "--score": `${overall * 3.6}deg` } as React.CSSProperties}><span><strong>{overall}</strong><small>مؤشر المحفظة</small>{scoreDelta > 0 && <em>ارتفع {scoreDelta} نقطة</em>}</span></div>
          <div className="ip-analysis-copy"><span className="ip-eyebrow"><Sparkles size={15} /> قراءة عائد الذكية</span><h2>{total ? "محفظتك تنمو في اتجاه واعد" : "ابدأ مساهمتك ليكتمل التحليل"}</h2><p>{total ? recommendation : "يحتاج المحرك إلى مساهمة واحدة على الأقل ليبني قراءة مخصصة"}</p><div className="ip-confidence"><ShieldCheck size={17} /><span>ثقة التحليل</span><b>{total ? 88 : 40}٪</b></div></div>
        </section>
        <section className="ip-ai-metrics">
          <article><span className="ip-icon blue"><BarChart3 size={21} /></span><small>تنوع المحفظة</small><strong>{diversity}</strong><p>{positions.length} فرص ضمن التوزيع الحالي</p></article>
          <article><span className="ip-icon mint"><Leaf size={21} /></span><small>قوة الأثر</small><strong>{impact}</strong><p>مؤشر تقديري لنطاق الأثر السكني</p></article>
          <article><span className="ip-icon cyan"><Target size={21} /></span><small>أعلى تركيز</small><strong>{concentration}٪</strong><p>نسبة أكبر فرصة من إجمالي المحفظة</p></article>
        </section>
        <section className="ip-insight-grid">
          <article className="ip-insight-main"><div className="ip-section-heading"><div><span>توصية قابلة للتنفيذ</span><h2>خطوتك الذكية التالية</h2></div><LineChart size={24} /></div><p>{recommendation}</p><div className="ip-scenario"><span><small>المحفظة الآن</small><b>{money(total)}</b></span><ArrowLeft size={20} /><span><small>بعد إضافة 5000 ريال</small><b>{money(total + 5000)}</b></span></div></article>
          <article className="ip-risk"><span className="ip-icon soft"><ShieldCheck size={21} /></span><h3>قراءة المخاطر</h3><strong>{concentration > 60 ? "تركيز يحتاج تنويعًا" : "توزيع ضمن النطاق الجيد"}</strong><p>تمت مقارنة حجم كل مساهمة مع إجمالي المحفظة وعدد الفرص</p></article>
        </section>
        <SuggestedOpportunity opportunity={suggestion} />
        <p className="ip-analysis-disclaimer">يتغير المؤشر مع كل 500 ريال ومع توزيع المساهمة بين الفرص</p>
      </motion.div>}
      </AnimatePresence>
    </>
  );
}

export function InvestorPortal({ page }: { page: InvestorPortalPage }) {
  const [contributions, setContributions] = useState(() => loadDemoState().contributions);
  const positions = useMemo(() => buildPositions(contributions), [contributions]);
  const total = contributions.reduce((sum, item) => sum + item.amount, 0);
  const suggestion = contributionOpportunities.find((item) => !positions.some((position) => position.opportunity.id === item.id)) ?? contributionOpportunities.slice().sort((a, b) => a.funded - b.funded)[0];
  const data = { contributions, positions, total, suggestion };
  return (
    <div className="investor-portal" dir="rtl">
      <PortalHeader page={page} />
      <div className="ip-shell">
        <aside className="ip-sidebar"><span>مساحة المستثمر</span><PortalNav page={page} /><div className="ip-secure"><ShieldCheck size={20} /><div><strong>بياناتك محمية</strong><small>تجربة محلية آمنة</small></div></div><a className="ip-back-home" href="/">العودة للمنصة <ChevronLeft size={16} /></a></aside>
        <main className="ip-main"><div className="ip-mobile-nav"><PortalNav page={page} /></div>{page === "overview" && <Overview {...data} />}{page === "wallet" && <WalletPage {...data} onAdded={() => setContributions(loadDemoState().contributions)} />}{page === "analysis" && <AnalysisPage {...data} />}</main>
      </div>
    </div>
  );
}
