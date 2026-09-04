"use client";

import { FormEvent, lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Bell,
  BrainCircuit,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  CircleDollarSign,
  Clock3,
  Home,
  LayoutDashboard,
  Leaf,
  LineChart,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  WalletCards,
  X,
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

type OpportunitySelection = {
  opportunity: ContributionOpportunity;
  position?: Position;
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
        <img src="/assets/aaid-logo.webp" alt="عائد" decoding="async" />
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

function SuggestedOpportunity({ opportunity, onOpen }: { opportunity: ContributionOpportunity; onOpen?: (opportunity: ContributionOpportunity, trigger: HTMLButtonElement) => void }) {
  const content = <>
    <img src={opportunity.image} alt={opportunity.imageAlt} decoding="async" />
    <div className="ip-suggestion-copy">
      <span className="ip-eyebrow"><Sparkles size={15} /> فرصة مقترحة لك</span>
      <h2>{opportunity.title}</h2>
      <p>اختيار مناسب لتوسيع توزيع محفظتك داخل مدينة الرياض ورفع تنوع الأثر السكني</p>
      <div className="ip-suggestion-facts">
        <span><Target size={16} /> تم جمع {opportunity.funded}٪</span>
        <span><Home size={16} /> {opportunity.district}</span>
      </div>
    </div>
  </>;
  return (
    <article className={`ip-suggestion ${onOpen ? "has-details" : ""}`}>
      {onOpen ? <button className="ip-suggestion-open" type="button" onClick={(event) => onOpen(opportunity, event.currentTarget)} aria-haspopup="dialog" aria-label={`عرض تفاصيل ${opportunity.title}`}>{content}</button> : content}
      <a href={`/start?opportunity=${encodeURIComponent(opportunity.id)}`}>ساهم في الفرصة <ArrowLeft size={18} /></a>
    </article>
  );
}

function PositionCard({ position, total, onOpen }: { position: Position; total: number; onOpen: (position: Position, trigger: HTMLButtonElement) => void }) {
  const share = total ? Math.round(position.amount / total * 100) : 0;
  return (
    <button className="ip-position-card" type="button" onClick={(event) => onOpen(position, event.currentTarget)} aria-haspopup="dialog" aria-label={`عرض تفاصيل ${position.opportunity.title}`}>
      <div className="ip-position-image">
        <img src={position.opportunity.image} alt={position.opportunity.imageAlt} loading="lazy" decoding="async" />
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
    </button>
  );
}

function OpportunityDetailsModal({ selection, total, onClose, reduceMotion }: { selection: OpportunitySelection; total: number; onClose: () => void; reduceMotion: boolean }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { opportunity, position } = selection;
  const portfolioShare = position && total ? Math.round(position.amount / total * 100) : 0;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div className="ip-opportunity-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .18 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <motion.div ref={dialogRef} className="ip-opportunity-modal" role="dialog" aria-modal="true" aria-labelledby="ip-opportunity-title" initial={{ opacity: 0, y: reduceMotion ? 0 : 22, scale: reduceMotion ? 1 : .975 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduceMotion ? 0 : 12, scale: reduceMotion ? 1 : .985 }} transition={{ duration: reduceMotion ? 0 : .28, ease: motionTokens.easing.smooth }}>
        <button ref={closeRef} className="ip-opportunity-close" type="button" onClick={onClose} aria-label="إغلاق تفاصيل الفرصة"><X size={19} aria-hidden="true" /></button>

        <div className="ip-opportunity-hero">
          <div className="ip-opportunity-image"><img src={opportunity.image} alt={opportunity.imageAlt} loading="lazy" decoding="async" /><span>{opportunity.status}</span></div>
          <div className="ip-opportunity-heading">
            <span><BadgeCheck size={16} aria-hidden="true" /> فرصة أثر موثوقة</span>
            <h2 id="ip-opportunity-title">{opportunity.title}</h2>
            <p>{opportunity.description}</p>
            <div><span><MapPin size={14} aria-hidden="true" /> {opportunity.district}</span><span><CalendarDays size={14} aria-hidden="true" /> مدة مستهدفة {opportunity.duration}</span></div>
          </div>
        </div>

        <div className="ip-opportunity-kpis">
          <div><small>مساهمتك في الفرصة</small><strong>{position ? money(position.amount) : "لم تبدأ بعد"}</strong></div>
          <div><small>العائد المتوقع</small><strong>{opportunity.expectedReturn}</strong></div>
          <div><small>الأثر المستهدف</small><strong>{opportunity.beneficiaries} مستفيد</strong></div>
          <div><small>مستوى الاستدامة</small><strong>{opportunity.sustainability}</strong></div>
        </div>

        <div className="ip-opportunity-content">
          <section aria-labelledby="ip-funding-title">
            <span>حالة التمويل</span>
            <h3 id="ip-funding-title">تقدم الفرصة بوضوح</h3>
            <div className="ip-opportunity-funding"><div><small>تم جمع</small><strong>{opportunity.funded}٪</strong></div><div><small>المتبقي</small><strong>{100 - opportunity.funded}٪</strong></div></div>
            <div className="ip-opportunity-progress" role="progressbar" aria-label={`نسبة تمويل ${opportunity.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={opportunity.funded}><motion.i initial={{ scaleX: 0 }} animate={{ scaleX: opportunity.funded / 100 }} transition={{ duration: reduceMotion ? 0 : .65, ease: motionTokens.easing.smooth }} /></div>
            <p>الهدف التمويلي {opportunity.target} ريال مع تحديث نسبة الإنجاز داخل المنصة</p>
          </section>
          <section aria-labelledby="ip-portfolio-title">
            <span>داخل محفظتك</span>
            <h3 id="ip-portfolio-title">صورة مساهمتك</h3>
            <div className="ip-opportunity-list">
              <div><Check size={15} aria-hidden="true" /><span><strong>{position ? `${portfolioShare}٪ من قيمة محفظتك` : "جاهزة للإضافة إلى محفظتك"}</strong><small>تظهر النسبة تلقائيا بعد كل مساهمة</small></span></div>
              <div><Check size={15} aria-hidden="true" /><span><strong>{position ? `${position.contributions} مساهمة مسجلة` : "متابعة موحدة للمساهمات"}</strong><small>سجل واضح للمبالغ والتحديثات</small></span></div>
              <div><Check size={15} aria-hidden="true" /><span><strong>تقارير أثر دورية</strong><small>قياس التمويل والمستفيدين ضمن لوحة المستثمر</small></span></div>
            </div>
          </section>
        </div>

        <div className="ip-opportunity-footer"><div><ShieldCheck size={18} aria-hidden="true" /><span><strong>وضوح قبل المساهمة</strong><small>المؤشرات تقديرية للنموذج الأولي ولا تمثل ضمانا للعائد</small></span></div><a href={`/start?opportunity=${encodeURIComponent(opportunity.id)}`}>{position ? "زيادة المساهمة" : "ابدأ المساهمة"}<ArrowLeft size={17} aria-hidden="true" /></a></div>
      </motion.div>
    </motion.div>
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
  const returnValue = Math.round(positions.reduce((sum, position) => sum + position.amount * (Number.parseFloat(position.opportunity.expectedReturn.replace("٪", "")) / 100), 0));
  const reduceMotion = useReducedMotion();
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunitySelection | null>(null);
  const opportunityTriggerRef = useRef<HTMLButtonElement | null>(null);
  const requestedContributionId = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("contribution");
  const recentContribution = contributions.find((item) => item.id === requestedContributionId) ?? contributions[0];
  const recentPosition = recentContribution ? positions.find((position) => position.opportunity.id === recentContribution.opportunityId) : undefined;
  const averageContribution = contributions.length ? Math.round(total / contributions.length) : 0;
  const largestPosition = positions.reduce((largest, position) => Math.max(largest, position.amount), 0);
  const concentration = total ? Math.round(largestPosition / total * 100) : 0;
  const nextUpdate = recentContribution ? cleanDate(new Date(new Date(recentContribution.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()) : "";
  const isFreshContribution = Boolean(requestedContributionId && recentContribution?.id === requestedContributionId);
  const openOpportunity = (selection: OpportunitySelection, trigger: HTMLButtonElement) => {
    opportunityTriggerRef.current = trigger;
    setSelectedOpportunity(selection);
  };
  const closeOpportunity = () => {
    setSelectedOpportunity(null);
    window.requestAnimationFrame(() => opportunityTriggerRef.current?.focus());
  };
  const overviewFlow = {
    hidden: {},
    visible: { transition: { staggerChildren: reduceMotion ? 0 : .07 } },
  };
  const overviewItem = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? .1 : .42, ease: motionTokens.easing.smooth } },
  };
  return (
    <motion.div className="ip-overview" variants={overviewFlow} initial="hidden" animate="visible">
      <motion.section className="ip-page-intro" variants={overviewItem}>
        <div><span className="ip-live"><i /> بيانات محفظتك محدثة</span><h1>مرحبًا بك مستثمر عائد</h1><p>هنا ترى قيمة مساهماتك وما تصنعه من أثر في مكان واحد</p></div>
        <a href="/opportunities">مساهمة جديدة <ArrowLeft size={18} /></a>
      </motion.section>

      <motion.section className="ip-hero-summary" variants={overviewItem}>
        <div className="ip-balance-panel">
          <div className="ip-balance-topline"><span><WalletCards size={16} /> المحفظة</span><small><Clock3 size={14} /> آخر تحديث الآن</small></div>
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
      </motion.section>

      {recentContribution && recentPosition && <motion.section className={`ip-overview-pulse ${isFreshContribution ? "is-highlighted" : ""}`} aria-labelledby="recent-contribution-title" variants={overviewItem}>
        <div className="ip-pulse-primary">
          <div className="ip-pulse-heading"><span className="ip-pulse-check"><Check size={20} aria-hidden="true" /></span><div><small>{isFreshContribution ? "تمت إضافة مساهمتك إلى المحفظة" : "آخر مساهمة مكتملة"}</small><h2 id="recent-contribution-title">{recentContribution.opportunityTitle}</h2></div></div>
          <strong>{money(recentContribution.amount)}</strong>
          <div className="ip-pulse-meta"><span><Clock3 size={14} aria-hidden="true" /> {cleanDate(recentContribution.createdAt)}</span><span><ShieldCheck size={14} aria-hidden="true" /> مرجع #{recentContribution.id.slice(-6)}</span></div>
          <button type="button" onClick={(event) => openOpportunity({ opportunity: recentPosition.opportunity, position: recentPosition }, event.currentTarget)}>عرض تفاصيل المساهمة <ArrowLeft size={16} aria-hidden="true" /></button>
        </div>
        <div className="ip-pulse-stats">
          <div className="ip-pulse-stats-heading"><span>قراءة المحفظة الآن</span><a href="/analysis">تحليل أعمق <ChevronLeft size={15} aria-hidden="true" /></a></div>
          <div className="ip-pulse-stat-grid">
            <div><small>إجمالي المساهمات</small><strong>{contributions.length}</strong><span>عملية مكتملة</span></div>
            <div><small>متوسط المساهمة</small><strong>{money(averageContribution)}</strong><span>حسب سجلك الحالي</span></div>
            <div><small>أعلى تركيز</small><strong>{concentration}٪</strong><span>{positions.length > 1 ? "موزع بين عدة فرص" : "ضمن فرصة واحدة"}</span></div>
            <div><small>التحديث القادم</small><strong>{nextUpdate}</strong><span>موعد تقديري للتقرير</span></div>
          </div>
        </div>
      </motion.section>}

      <motion.div className="ip-overview-suggestion" variants={overviewItem}><SuggestedOpportunity opportunity={suggestion} onOpen={(opportunity, trigger) => openOpportunity({ opportunity }, trigger)} /></motion.div>

      <motion.section className="ip-section" aria-labelledby="positions-title" variants={overviewItem}>
        <div className="ip-section-heading"><div><span>محفظتك الحالية</span><h2 id="positions-title">فرص ساهمت فيها</h2></div><a href="/wallet">إدارة المحفظة <ChevronLeft size={17} /></a></div>
        {positions.length ? <div className="ip-position-grid">{positions.map((position) => <PositionCard key={position.opportunity.id} position={position} total={total} onOpen={(item, trigger) => openOpportunity({ opportunity: item.opportunity, position: item }, trigger)} />)}</div> : <EmptyPortfolio />}
      </motion.section>

      <motion.section className="ip-activity" aria-labelledby="activity-title" variants={overviewItem}>
        <div className="ip-section-heading"><div><span>سجل واضح</span><h2 id="activity-title">آخر نشاط</h2></div>{contributions.length > 0 && <span className="ip-activity-total">{contributions.length} مساهمة بقيمة {money(total)}</span>}</div>
        {contributions.length ? contributions.slice(0, 4).map((item) => <div className="ip-activity-row" key={item.id}><span className="ip-icon soft"><Check size={18} /></span><div><strong>مساهمة مكتملة</strong><small className="ip-activity-context"><span>{item.opportunityTitle}</span><em>مرجع #{item.id.slice(-6)}</em></small></div><time>{cleanDate(item.createdAt)}</time><b>{money(item.amount)}</b></div>) : <p className="ip-muted">لا توجد مساهمات مسجلة حتى الآن</p>}
      </motion.section>
      <AnimatePresence mode="wait">{selectedOpportunity && <OpportunityDetailsModal key={selectedOpportunity.opportunity.id} selection={selectedOpportunity} total={total} onClose={closeOpportunity} reduceMotion={Boolean(reduceMotion)} />}</AnimatePresence>
    </motion.div>
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
      <section className="ip-section"><div className="ip-section-heading"><div><span>توزيع ذكي</span><h2>تفاصيل المحفظة</h2></div></div>{positions.length ? <div className="ip-allocation-list">{positions.map((position) => { const share = total ? Math.round(position.amount / total * 100) : 0; return <div key={position.opportunity.id}><img src={position.opportunity.image} alt="" loading="lazy" decoding="async" /><div><strong>{position.opportunity.title}</strong><small>{position.contributions} مساهمة</small><span className="ip-progress"><i style={{ width: `${share}%` }} /></span></div><b>{money(position.amount)}</b><em>{share}٪</em></div>; })}</div> : <EmptyPortfolio />}</section>
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
  const analysisMessages = ["نربط بيانات مساهماتك", "نقيس التوازن والتركيز", "نحاكي نمو الأثر", "نبني توصيتك الذكية"] as const;
  const analysisSteps = ["قراءة المحفظة", "قياس التوزيع", "محاكاة الأثر", "صياغة التوصية"] as const;

  useEffect(() => {
    const handleVisibility = () => setPageVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
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
    setEngineReady(false);
    setStatus("analyzing");
    void import("../components/ImpactUniverse").then(() => setEngineReady(true));
  };
  return (
    <>
      <section className="ip-page-intro compact"><div><span className="ip-live"><i /> محرك عائد جاهز</span><h1>تحليل عائد AI</h1><p>قراءة ذكية مبنية على بيانات محفظتك الحالية</p></div><motion.button className="ip-analysis-button" type="button" onClick={startAnalysis} disabled={status === "analyzing"} whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: .98 }} transition={springs.snappy}><span className="ip-analysis-button-icon"><BrainCircuit size={19} /></span><span><strong>{status === "analyzing" ? "يتم التحليل الآن" : "تحليل جديد"}</strong><small>{status === "analyzing" ? "نقرأ بيانات المحفظة" : "حدّث قراءة محفظتك"}</small></span><ArrowLeft size={17} aria-hidden="true" /></motion.button></section>
      <AnimatePresence mode="wait">
      {status === "analyzing" ? <motion.section key="analyzing" className={`ip-analyzing ${pageVisible ? "" : "is-paused"}`} aria-live="polite" aria-label="جاري تحليل المحفظة" initial={{ opacity: 0, y: reduceMotion ? 0 : 14, scale: reduceMotion ? 1 : .99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -8, scale: reduceMotion ? 1 : .99 }} transition={{ duration: reduceMotion ? motionTokens.duration.fast : motionTokens.duration.normal, ease: motionTokens.easing.smooth }}>
        <div className="ip-neural-scene" aria-hidden="true">
          <div className="ip-universe-halo" />
          <Suspense fallback={<div className="ip-universe-loader"><span /></div>}>
            <ImpactUniverse activeIndex={analysisStage} speed={24} globeOnly paused={!pageVisible} onReady={() => setSceneReady(true)} />
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
          <AnimatePresence mode="wait" initial={false}><motion.h2 key={analysisMessages[analysisStage]} initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }} transition={{ duration: motionTokens.duration.fast, ease: motionTokens.easing.smooth }}>{analysisMessages[analysisStage]}</motion.h2></AnimatePresence>
          <div className="ip-analysis-progress"><motion.i initial={{ scaleX: .05 }} animate={{ scaleX: (analysisStage + 1) / 4 }} transition={springs.gentle} /></div>
          <div className="ip-analysis-steps">{analysisSteps.map((label, index) => <span className={index < analysisStage ? "is-done" : index === analysisStage ? "is-active" : ""} key={label}><i>{index < analysisStage ? <Check size={13} /> : index + 1}</i>{label}</span>)}</div>
          <small>تتم المعالجة محليًا داخل تجربة عائد</small>
        </div>
      </motion.section> : <motion.div key="results" className="ip-analysis-results" initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? motionTokens.duration.fast : motionTokens.duration.normal, ease: motionTokens.easing.smooth }}>
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
