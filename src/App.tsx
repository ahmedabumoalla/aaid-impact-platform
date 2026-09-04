"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowUpLeft,
  BarChart3,
  Building2,
  Check,
  CircleDollarSign,
  DatabaseZap,
  Gauge,
  HandHeart,
  MapPinned,
  Menu,
  Radio,
  Sparkles,
  TrendingUp,
  Users,
  Waypoints,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { calculateImpact, formatSar } from "./lib/impact";
import { motionTokens, springs } from "./lib/motion-tokens";
import { InvestorEntry } from "./pages/InvestorEntry";
import { StartContribution } from "./pages/StartContribution";
import { InvestorPortal } from "./pages/InvestorPortal";
import { ContributionOpportunitiesPage } from "./pages/ContributionOpportunitiesPage";
import { ContributionOpportunityCard } from "./components/ContributionOpportunityCard";
import { contributionOpportunities } from "./data/contribution-opportunities";

const ease = motionTokens.easing.smooth;
const ImpactUniverse = lazy(() =>
  import("./components/ImpactUniverse").then((module) => ({ default: module.ImpactUniverse })),
);

const journeySteps = [
  {
    id: "contribute",
    number: "01",
    label: "ساهم",
    title: "تبدأ بقيمة تختارها أنت",
    body: "مساهمة واحدة تُسجّل في محفظة أثرك بوضوح كامل من لحظة الدفع وحتى التخصيص",
    metric: "مساهمة موثّقة",
    value: "100%",
    icon: HandHeart,
  },
  {
    id: "invest",
    number: "02",
    label: "تُستثمر",
    title: "تتحول المساهمة إلى أصل",
    body: "تُجمع المساهمات وتُوجّه لفرص مدروسة مع مديري أصول مرخّصين وفق حوكمة واضحة",
    metric: "عائد مستهدف",
    value: "15%",
    icon: TrendingUp,
  },
  {
    id: "return",
    number: "03",
    label: "يعود",
    title: "العائد لا يتوقف عند دورة واحدة",
    body: "يعاد استثمار جزء من العوائد لبناء أصل أقوى ويُوجّه الباقي لصناعة أثر سكني قابل للقياس",
    metric: "قيمة الأصل بعد 5 أعوام",
    value: "1.25×",
    icon: CircleDollarSign,
  },
  {
    id: "impact",
    number: "04",
    label: "يصنع أثرًا",
    title: "كل عائد يصبح قصة سكن",
    body: "ترى الأسر المستفيدة وقيمة الأثر ونمو مساهمتك في لوحة واحدة بدل تقرير جامد في نهاية العام",
    metric: "أسرة لكل مليون",
    value: "57",
    icon: Building2,
  },
] as const;

const journeyAccents = ["#22d3ee", "#3b82f6", "#18c8a4", "#67e8f9"] as const;

const modelSources = [
  { className: "model-source--project", title: "بيانات المشاريع", caption: "فرص استثمارية", icon: Building2 },
  { className: "model-source--organizations", title: "الجهات الموثوقة", caption: "مؤسسات وشراكات", icon: Users },
  { className: "model-source--donors", title: "بيانات المساهمين", caption: "الاهتمامات والسلوك", icon: Users },
  { className: "model-source--performance", title: "أداء الاستثمارات", caption: "العوائد والأثر", icon: BarChart3 },
  { className: "model-source--community", title: "البيانات المجتمعية", caption: "مؤشرات التنمية", icon: DatabaseZap },
  { className: "model-source--need", title: "الاحتياج الفعلي", caption: "تحليل المناطق", icon: MapPinned },
] as const;

const opportunities = [
  { type: "أصل سكني", name: "محفظة إسكان الرياض", returnValue: "14.8%", impact: "18 أسرة", risk: "متوازن" },
  { type: "صندوق أثر", name: "نمو المجتمعات الواعدة", returnValue: "12.4%", impact: "31 أسرة", risk: "محافظ" },
  { type: "وقف تنموي", name: "وقف المسكن المستدام", returnValue: "10.9%", impact: "44 أسرة", risk: "منخفض" },
];

const dataParticles = [
  { x: ["1%", "14%", "29%", "43%", "50%"], y: ["14%", "21%", "30%", "40%", "45%"], duration: 8.4, delay: -1.4, size: 7 },
  { x: ["99%", "84%", "70%", "57%", "50%"], y: ["16%", "24%", "31%", "39%", "45%"], duration: 9.1, delay: -5.2, size: 5 },
  { x: ["4%", "17%", "30%", "43%", "50%"], y: ["88%", "73%", "61%", "51%", "45%"], duration: 9.8, delay: -7.1, size: 4 },
  { x: ["96%", "83%", "70%", "58%", "50%"], y: ["88%", "74%", "61%", "51%", "45%"], duration: 10.2, delay: -3.6, size: 6 },
  { x: ["48%", "45%", "47%", "49%", "50%"], y: ["1%", "14%", "27%", "39%", "45%"], duration: 7.8, delay: -4.3, size: 4 },
  { x: ["53%", "57%", "55%", "52%", "50%"], y: ["99%", "83%", "67%", "53%", "45%"], duration: 9.6, delay: -8.4, size: 5 },
  { x: ["1%", "13%", "28%", "42%", "50%"], y: ["49%", "54%", "52%", "48%", "45%"], duration: 8.9, delay: -2.7, size: 7 },
  { x: ["99%", "86%", "71%", "58%", "50%"], y: ["48%", "53%", "52%", "48%", "45%"], duration: 9.4, delay: -6.1, size: 3 },
  { x: ["18%", "27%", "36%", "44%", "50%"], y: ["1%", "13%", "25%", "37%", "45%"], duration: 8.2, delay: -6.8, size: 4 },
  { x: ["84%", "77%", "68%", "58%", "50%"], y: ["99%", "83%", "67%", "53%", "45%"], duration: 10.4, delay: -10.4, size: 5 },
] as const;

function Reveal({ children, className = "", delay = 0, ariaLabel }: { children: ReactNode; className?: string; delay?: number; ariaLabel?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      aria-label={ariaLabel}
      initial={{ opacity: 0, y: reduceMotion ? 0 : motionTokens.distance.lg }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: reduceMotion ? motionTokens.duration.fast : motionTokens.duration.slow,
        delay: reduceMotion ? 0 : delay,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a className={`brand ${light ? "brand--light" : ""}`} href="#top" aria-label="عائد الصفحة الرئيسية">
      <img src="/assets/aaid-logo.png" alt="عائد" />
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <nav className="nav shell" aria-label="التنقل الرئيسي">
        <Logo />
        <div className="nav-links">
          <a href="#about">عن عائد</a>
          <a href="#journey">كيف يعمل</a>
          <a href="#opportunities">فرص الأثر</a>
          <a href="#calculator">حاسبة الأثر</a>
          <a href="/investor">لوحة المستثمر</a>
          <a href="#faq">الأسئلة الشائعة</a>
        </div>
        <a className="nav-cta" href="/start">
          ابدأ الآن
          <ArrowLeft size={17} aria-hidden="true" />
        </a>
        <button
          className="menu-button"
          type="button"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </nav>
      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            id="mobile-navigation"
            className="mobile-nav"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease }}
          >
            <a href="#about" onClick={closeMenu}>عن عائد</a>
            <a href="#journey" onClick={closeMenu}>كيف يعمل</a>
            <a href="#opportunities" onClick={closeMenu}>فرص الأثر</a>
            <a href="#calculator" onClick={closeMenu}>حاسبة الأثر</a>
            <a href="/investor" onClick={closeMenu}>لوحة المستثمر</a>
            <a href="/start" onClick={closeMenu}>ابدأ الآن</a>
            <a href="#faq" onClick={closeMenu}>الأسئلة الشائعة</a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero() {
  return (
    <main id="top">
      <section className="hero" aria-labelledby="hero-title">
        <span className="hero-orbital hero-orbital--one" aria-hidden="true" />
        <span className="hero-orbital hero-orbital--two" aria-hidden="true" />

        <div className="shell hero-grid">
          <Reveal className="hero-copy">
            <span className="eyebrow"><Sparkles size={15} aria-hidden="true" /> عطاء ينمو وأثر يستمر</span>
            <h1 id="hero-title">
              عطاؤك لا ينتهي
              <span>بل يعود أثرًا</span>
            </h1>
            <p>نحو أثر مستدام في الإسكان التنموي حيث يتحول عطاؤك اليوم إلى أصل ينمو ويصنع مستقبلًا أفضل للأجيال</p>
            <div className="hero-actions">
              <a className="primary-button" href="/start">ابدأ الآن <ArrowLeft size={18} aria-hidden="true" /></a>
              <a className="text-button" href="#journey">اعرف كيف يعمل عائد <span className="play-mark" aria-hidden="true">‹</span></a>
            </div>
            <div className="trust-line" aria-label="مزايا عائد">
              <span><Check size={15} aria-hidden="true" /> أثر واضح وقابل للقياس</span>
              <span><Check size={15} aria-hidden="true" /> شفافية في كل مرحلة</span>
            </div>
          </Reveal>

          <Reveal className="impact-stage">
            <div className="hero-art-viewport">
              <div className="stage-halo" aria-hidden="true" />
              <div className="scene-window scene-window--showcase">
                <img className="scene-image scene-image--showcase" src="/assets/aaid-hero-home-premium.png" alt="مسكن تنموي تحيط به مسارات مضيئة ترمز لنمو الأثر" />
                <div className="impact-orb impact-orb--hand" aria-hidden="true">
                  <img src="/assets/aaid-impact-hand.png" alt="" />
                </div>
                <div className="impact-orb impact-orb--sprout" aria-hidden="true">
                  <img src="/assets/aaid-impact-sprout.png" alt="" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="shell hero-metrics" delay={0.08} ariaLabel="مؤشرات الأثر">
          <div><strong>15%</strong><span>عائد سنوي مستهدف يعاد توجيهه للأثر</span></div>
          <div><strong>100%</strong><span>وضوح في مسار المساهمة وتخصيصها</span></div>
          <div><strong>57</strong><span>أسرة مستفيدة لكل مليون ريال</span></div>
          <a href="#calculator">احسب أثر مساهمتك <ArrowUpLeft size={15} aria-hidden="true" /></a>
        </Reveal>

        <div className="impact-ticker" aria-hidden="true">
          <div className="impact-ticker-track">
            <span>مساهمة</span><i /><span>استثمار</span><i /><span>عائد</span><i /><span>سكن</span><i /><span>أثر مستدام</span><i />
            <span>مساهمة</span><i /><span>استثمار</span><i /><span>عائد</span><i /><span>سكن</span><i /><span>أثر مستدام</span><i />
          </div>
        </div>
      </section>
    </main>
  );
}

function Journey() {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<(typeof journeySteps)[number]["id"]>("contribute");
  const active = journeySteps.find((step) => step.id === activeId)!;
  const activeIndex = journeySteps.findIndex((step) => step.id === activeId);
  const ActiveIcon = active.icon;
  const progress = (activeIndex + 1) * 25;

  return (
    <section className="journey section" id="journey" aria-labelledby="journey-title">
      <div className="shell">
        <Reveal className="section-heading">
          <div>
            <span className="section-kicker">رحلة الأثر</span>
            <h2 id="journey-title">من مساهمة واحدة<br />إلى أثر لا يتوقف</h2>
          </div>
          <p>عائد لا يطلب منك أن تتخيل أثر مساهمتك كل مرحلة قابلة للمتابعة من أول ريال وحتى البيت الذي صنعه العائد</p>
        </Reveal>
        <motion.div
          className="journey-layout"
          style={{ "--journey-accent": journeyAccents[activeIndex] } as React.CSSProperties}
          initial={{ opacity: 0, y: reduceMotion ? 0 : motionTokens.distance.lg }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: reduceMotion ? motionTokens.duration.fast : motionTokens.duration.slow, delay: reduceMotion ? 0 : 0.08, ease }}
        >
          <div className="journey-topline">
            <span><Radio size={14} aria-hidden="true" /> منظومة الأثر تعمل الآن</span>
            <span>AAID IMPACT ENGINE</span>
          </div>
          <div className="journey-tabs" role="tablist" aria-label="مراحل رحلة الأثر">
            {journeySteps.map((step) => {
              const Icon = step.icon;
              const isActive = activeId === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="journey-panel"
                  className={isActive ? "active" : ""}
                  onClick={() => setActiveId(step.id)}
                >
                  <span className="step-number">{step.number}</span>
                  <span className="step-icon"><Icon size={19} aria-hidden="true" /></span>
                  <strong>{step.label}</strong>
                  {isActive && <motion.span className="tab-glow" layoutId="active-journey-step" transition={{ duration: motionTokens.duration.normal, ease }} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
          <div id="journey-panel" role="tabpanel" className="journey-panel">
            <AnimatePresence mode="wait">
              <motion.div
                className="panel-copy"
                key={active.id}
                initial={{ opacity: 0, x: motionTokens.distance.lg }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -motionTokens.distance.md }}
                transition={{ duration: motionTokens.duration.normal, ease }}
              >
                <span className="stage-ghost" aria-hidden="true">{active.number}</span>
                <span className="panel-index">{active.number} / 04</span>
                <h3>{active.title}</h3>
                <p>{active.body}</p>
                <div className="journey-proof">
                  <span><Check size={14} aria-hidden="true" /> توثيق تلقائي</span>
                  <span><Activity size={14} aria-hidden="true" /> تتبع مباشر</span>
                </div>
                <div className="stage-progress" aria-label={`المرحلة ${activeIndex + 1} من 4`}>
                  <span>تقدم رحلة الأثر</span>
                  <i><motion.b animate={{ scaleX: progress / 100 }} transition={springs.gentle} /></i>
                  <strong>{progress}%</strong>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="panel-visual" aria-hidden="true">
              <div className="universe-grid model-grid" />
              <Suspense fallback={<div className="universe-loading"><span /></div>}>
                <ImpactUniverse activeIndex={activeIndex} />
              </Suspense>
              <svg className="model-connectors" viewBox="0 0 1000 560" preserveAspectRatio="none">
                <path fill="none" d="M175 118C270 118 310 176 395 205" />
                <path fill="none" d="M175 444C285 444 330 357 404 318" />
                <path fill="none" d="M825 118C730 118 690 176 605 205" />
                <path fill="none" d="M825 444C715 444 670 357 596 318" />
              </svg>
              <div className="model-energy-column" />
              {modelSources.map((source, index) => {
                const SourceIcon = source.icon;
                return (
                  <motion.div
                    className={`model-source ${source.className}`}
                    key={source.title}
                    initial={{ opacity: 0, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ ...springs.gentle, delay: index * 0.08 }}
                  >
                    <span><strong>{source.title}</strong><small>{source.caption}</small></span>
                    <i><SourceIcon size={17} /></i>
                  </motion.div>
                );
              })}
              <span className="model-live"><i /> نموذج حي</span>
              <span className="model-chip-label">AI</span>
            </div>
          </div>
          <div className="journey-console">
            <span><i /> المصدر محفظة عائد</span>
            <span>تشفير البيانات فعال</span>
            <span>آخر مزامنة الآن</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ContributionOpportunities() {
  return (
    <section className="contribution-showcase" aria-labelledby="contribution-opportunities-title">
      <div className="shell">
        <Reveal className="contribution-showcase-heading">
          <div>
            <span>فرص مختارة في مدينة الرياض</span>
            <h2 id="contribution-opportunities-title">فرص المساهمة</h2>
          </div>
          <a href="/opportunities">مشاهدة الكل <ArrowLeft size={15} aria-hidden="true" /></a>
        </Reveal>
        <div className="contribution-cards">
          {contributionOpportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: .2 }}
              transition={{ duration: .45, delay: index * .06, ease }}
            >
              <ContributionOpportunityCard opportunity={opportunity} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Opportunities() {
  const reduceMotion = useReducedMotion();
  const [documentVisible, setDocumentVisible] = useState(true);

  useEffect(() => {
    const handleVisibility = () => setDocumentVisible(document.visibilityState !== "hidden");
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const pauseEngine = reduceMotion || !documentVisible;

  return (
    <section className="opportunities section" id="opportunities" aria-labelledby="opportunities-title">
      <div className="shell">
        <Reveal className="section-heading section-heading--light">
          <div>
            <span className="section-kicker">فرص مختارة بالذكاء الاصطناعي</span>
            <h2 id="opportunities-title">ليس أعلى عائد فقط<br />بل أذكى أثر</h2>
          </div>
          <p>يقارن محرك عائد بين العائد والمخاطر وحجم الأثر المتوقع ليضع القرار في صورة واحدة قابلة للفهم</p>
        </Reveal>
        <Reveal className="opportunity-command" delay={0.08}>
          <div className="command-copy">
            <span className="command-label"><DatabaseZap size={14} aria-hidden="true" /> قرار متعدد الأبعاد</span>
            <h3>نقرأ ما وراء<br />نسبة العائد</h3>
            <p>كل فرصة تمر عبر طبقات مالية واجتماعية وتنظيمية قبل وصولها إلى محفظتك</p>
            <div className="command-stats">
              <div><strong>24</strong><span>عامل تحليل</span></div>
              <div><strong>04</strong><span>طبقات قرار</span></div>
              <div><strong>01</strong><span>صورة واضحة</span></div>
            </div>
          </div>
          <div className={`radar-visual ${pauseEngine ? "is-motion-paused" : ""}`} aria-hidden="true">
            <motion.div
              className="engine-image-wrap"
              animate={pauseEngine ? undefined : { scale: [1, 1.035, 1], x: ["0%", "-.7%", "0%"] }}
              transition={{ duration: motionTokens.duration.crawl * 14, repeat: Infinity, ease }}
            >
              <img className="engine-image" src="/assets/aaid-analysis-engine.png" alt="" />
            </motion.div>
            <div className="engine-vignette" />
            <div className="engine-scanline" />
            <svg className="engine-flow-map" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice">
              <g className="engine-flow-lines" fill="none">
                <path fill="none" d="M0 205C310 186 505 356 836 421" />
                <path fill="none" d="M1672 156C1370 182 1160 338 836 421" />
                <path fill="none" d="M70 820C354 701 552 554 836 421" />
                <path fill="none" d="M1604 798C1332 690 1118 548 836 421" />
                <path fill="none" d="M648 0C682 188 742 314 836 421" />
                <path fill="none" d="M1050 941C1001 720 938 566 836 421" />
              </g>
              {dataParticles.map((particle, index) => (
                <motion.circle
                  key={index}
                  className="data-particle"
                  r={particle.size * 1.5}
                  cx={particle.x[0]}
                  cy={particle.y[0]}
                  animate={pauseEngine ? undefined : {
                    cx: [...particle.x],
                    cy: [...particle.y],
                    opacity: [0, .76, 1, 1, 0],
                  }}
                  transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: motionTokens.easing.linear }}
                />
              ))}
            </svg>
            <div className="engine-core-signal"><i /><i /><span /></div>
            <div className="engine-score"><Waypoints size={16} /><span><strong>96</strong><small>مؤشر الملاءمة</small></span></div>
            <span className="radar-tag radar-tag--return"><TrendingUp size={13} /> العائد</span>
            <span className="radar-tag radar-tag--risk"><Gauge size={13} /> المخاطر</span>
            <span className="radar-tag radar-tag--impact"><MapPinned size={13} /> الأثر</span>
            <div className="analysis-sequence">
              <span><i /> بيانات</span><b />
              <span><i /> مراجعة</span><b />
              <span><i /> قرار</span>
            </div>
          </div>
        </Reveal>
        <Reveal className="opportunity-label">
          <span><i /> بيانات نموذجية للعرض</span>
          <span>تحديث المحرك الآن</span>
        </Reveal>
        <div className="opportunity-table" role="table" aria-label="نماذج فرص الأثر">
          <div className="opportunity-row opportunity-row--head" role="row">
            <span role="columnheader">الفرصة</span>
            <span role="columnheader">العائد المتوقع</span>
            <span role="columnheader">الأثر المستهدف</span>
            <span role="columnheader">ملف المخاطر</span>
            <span role="columnheader" aria-label="إجراء" />
          </div>
          {opportunities.map((opportunity, index) => (
            <motion.div
              className="opportunity-row"
              role="row"
              key={opportunity.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, delay: index * 0.08, ease }}
            >
              <span className="opportunity-name" role="cell"><small>{opportunity.type}</small><strong>{opportunity.name}</strong></span>
              <span className="return-value" role="cell">{opportunity.returnValue}</span>
              <span role="cell"><Users size={16} aria-hidden="true" /> {opportunity.impact}</span>
              <span role="cell"><i className={`risk-dot risk-dot--${index}`} /> {opportunity.risk}</span>
              <button type="button" aria-label={`استعراض ${opportunity.name}`}><ArrowUpLeft size={18} aria-hidden="true" /></button>
            </motion.div>
          ))}
        </div>
        <Reveal className="engine-note" delay={0.08}>
          <Sparkles size={18} aria-hidden="true" />
          <p><strong>ما الذي يراه محرك عائد</strong> أكثر من 24 عاملًا بين الاستدامة المالية والأثر الاجتماعي والسيولة والمخاطر التنظيمية</p>
          <a href="#calculator">حلّل أثرك <ArrowLeft size={16} aria-hidden="true" /></a>
        </Reveal>
      </div>
    </section>
  );
}

function Calculator() {
  const [amount, setAmount] = useState(250_000);
  const impact = calculateImpact(amount);

  return (
    <section className="calculator section" id="calculator" aria-labelledby="calculator-title">
      <span className="calculator-ghost" aria-hidden="true">05Y</span>
      <div className="shell calculator-shell">
        <Reveal className="calculator-copy">
          <span className="section-kicker">محاكاة ذكية</span>
          <h2 id="calculator-title">شاهد الغد الذي يمكن أن يصنعه عطاؤك</h2>
          <p>حرّك المؤشر وشاهد صورة أولية لنمو الأصل والعائد والأثر الاجتماعي على مدى خمس سنوات</p>
          <div className="assurance-list">
            <span><Check size={15} aria-hidden="true" /> بدون التزام أو تسجيل</span>
            <span><Check size={15} aria-hidden="true" /> النتائج تقديرية وليست ضمانًا للعائد</span>
          </div>
          <div className="simulator-status"><i /> المحرك جاهز للمحاكاة</div>
        </Reveal>
        <Reveal className="calculator-card">
          <div className="calculator-topline"><span>AAID IMPACT SIMULATOR</span><span><Activity size={13} /> تحليل مباشر</span></div>
          <div className="amount-control">
            <div>
              <label htmlFor="contribution-amount">قيمة مساهمتك</label>
              <output htmlFor="contribution-amount" aria-live="polite">{formatSar(amount)}</output>
            </div>
            <input
              id="contribution-amount"
              type="range"
              min="50000"
              max="2000000"
              step="50000"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              style={{ "--range-progress": `${((amount - 50_000) / 1_950_000) * 100}%` } as React.CSSProperties}
            />
            <div className="range-labels"><span>٥٠ ألف</span><span>٢ مليون</span></div>
          </div>
          <div className="impact-curve" aria-label="منحنى نمو الأثر المتوقع خلال خمس سنوات">
            <div className="curve-heading"><span>مسار نمو الأصل</span><strong>خمس سنوات</strong></div>
            <svg viewBox="0 0 640 180" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="curve-line" x1="0" x2="1">
                  <stop stopColor="#1bd4e8" />
                  <stop offset="1" stopColor="#4f75ff" />
                </linearGradient>
                <linearGradient id="curve-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#20cae5" stopOpacity=".28" />
                  <stop offset="1" stopColor="#20cae5" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 150 C105 145 110 118 205 120 S315 96 386 91 S515 48 640 24 L640 180 L0 180 Z" fill="url(#curve-fill)" />
              <motion.path d="M0 150 C105 145 110 118 205 120 S315 96 386 91 S515 48 640 24" fill="none" stroke="url(#curve-line)" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: motionTokens.duration.crawl, ease }} />
              {[0, 128, 256, 384, 512, 640].map((cx, index) => <circle key={cx} cx={cx} cy={[150,127,111,91,58,24][index]} r="4" className="curve-node" />)}
            </svg>
            <div className="curve-years"><span>اليوم</span><span>السنة 1</span><span>السنة 2</span><span>السنة 3</span><span>السنة 4</span><span>السنة 5</span></div>
          </div>
          <div className="projection-grid" aria-label="نتائج المحاكاة التقديرية">
            <div><span>عائد السنة الأولى</span><strong>{formatSar(impact.annualReturn)}</strong><small>وفق مستهدف 15%</small></div>
            <div><span>يعاد استثماره</span><strong>{formatSar(impact.reinvestedFirstYear)}</strong><small>في السنة الأولى</small></div>
            <div><span>قيمة الأصل المتوقعة</span><strong>{formatSar(impact.fiveYearAssetValue)}</strong><small>بعد خمس سنوات</small></div>
            <div className="projection-impact"><span>الأثر التراكمي</span><strong>{impact.familiesReached}</strong><small>أسرة مستفيدة تقريبًا</small></div>
          </div>
          <a className="primary-button calculator-button" href="/start">
            ابنِ محفظة أثرك
            <ArrowLeft size={19} aria-hidden="true" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="about" id="about" aria-labelledby="about-title">
      <div className="about-word" aria-hidden="true">عائد</div>
      <div className="about-orbit" aria-hidden="true"><i /><i /><i /></div>
      <Reveal className="shell about-inner">
        <div className="about-mark" aria-hidden="true">
          <span /><span /><span /><span /><span /><span /><span />
        </div>
        <div>
          <span className="section-kicker">لماذا عائد</span>
          <h2 id="about-title">لأن الأثر الحقيقي<br />لا يُقاس مرة واحدة</h2>
        </div>
        <p>عائد يجمع الاستثمار والشفافية وقياس الأثر في تجربة واحدة حتى يصبح العطاء أصلًا دائمًا لا ذكرى عابرة</p>
      </Reveal>
      <Reveal className="shell about-principles" delay={0.08}>
        <span>شفافية مستمرة</span><i />
        <span>عائد متجدد</span><i />
        <span>أثر قابل للقياس</span><i />
        <span>بيت يصنع الفرق</span>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer id="faq">
      <div className="shell footer-inner">
        <Logo light />
        <p>عطاء دائم لأثر مستدام</p>
        <div className="footer-links"><a href="#journey">كيف يعمل</a><a href="#opportunities">الفرص</a><a href="#calculator">الحاسبة</a></div>
      </div>
    </footer>
  );
}

export default function App() {
  const currentPath = window.location.pathname.replace(/\/+$/, "");

  if (currentPath === "/investor") return <InvestorEntry />;
  if (currentPath === "/investor/dashboard") return <InvestorPortal page="overview" />;
  if (currentPath === "/wallet") return <InvestorPortal page="wallet" />;
  if (currentPath === "/analysis" || currentPath === "/impact") return <InvestorPortal page="analysis" />;
  if (currentPath === "/documents" || currentPath === "/preferences") return <InvestorPortal page="overview" />;
  if (currentPath === "/start") return <StartContribution />;
  if (currentPath === "/opportunities") return <ContributionOpportunitiesPage />;

  return (
    <>
      <Header />
      <Hero />
      <ContributionOpportunities />
      <Journey />
      <Opportunities />
      <Calculator />
      <div className="closing-scene">
      <About />
        <Footer />
      </div>
    </>
  );
}
