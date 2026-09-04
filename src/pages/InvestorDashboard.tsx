import { useState, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  Bell,
  BrainCircuit,
  Building2,
  CalendarDays,
  ChevronLeft,
  CheckCircle2,
  CircleDollarSign,
  Cpu,
  Database,
  Download,
  FileCheck2,
  HandHeart,
  Home,
  LayoutDashboard,
  MapPin,
  Menu,
  MoreHorizontal,
  PieChart,
  ScanLine,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
  Zap,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { loadDemoState } from "../lib/demo-storage";
import "./investor-dashboard.css";
import "./investor-cinematic.css";
import "./investor-light.css";

function getOverviewMetrics(localTotal: number, localImpact: number) {
  return [
    { label: "إجمالي المساهمات", value: (1_250_000 + localTotal).toLocaleString("en-US"), unit: "ر.س", change: localTotal ? `+${localTotal.toLocaleString("en-US")} محفوظ محليًا` : "+12.4%", icon: WalletCards, tone: "blue" },
    { label: "قيمة الأصل الحالية", value: (1_386_400 + localTotal).toLocaleString("en-US"), unit: "ر.س", change: "+10.9%", icon: TrendingUp, tone: "cyan" },
    { label: "العائد المتحقق", value: (136_400 + localTotal * .15).toLocaleString("en-US", { maximumFractionDigits: 0 }), unit: "ر.س", change: "منذ بداية المحفظة", icon: CircleDollarSign, tone: "mint" },
    { label: "الأثر التراكمي", value: (71 + localImpact).toLocaleString("en-US", { maximumFractionDigits: 1 }), unit: "أسرة", change: "+14 أسرة هذا العام", icon: HandHeart, tone: "gold" },
  ] as const;
}

const aiFactors = [
  { label: "الأثر السكني", value: 94, detail: "31 أسرة متوقعة" },
  { label: "العائد", value: 88, detail: "أعلى من المستهدف" },
  { label: "الامتثال", value: 100, detail: "مراجعة مكتملة" },
  { label: "السيولة", value: 72, detail: "مدة 5 سنوات" },
  { label: "المخاطر", value: 81, detail: "مستوى متوازن" },
] as const;

const aiScenarios = [
  { label: "متحفظ", returnValue: "9.2%", families: "54 أسرة", tone: "muted" },
  { label: "أساسي", returnValue: "14.8%", families: "71 أسرة", tone: "active" },
  { label: "متفائل", returnValue: "18.1%", families: "86 أسرة", tone: "bright" },
] as const;

const timelineEvents = [
  { date: "اليوم", title: "اعتماد تقرير الأثر للربع الثالث", detail: "تم توثيق استفادة 8 أسر في مشروع واحة السكن", type: "impact", icon: FileCheck2 },
  { date: "28 أغسطس", title: "إعادة استثمار عائد دوري", detail: "أعيد توجيه 24,600 ر.س إلى محفظة الإسكان بالرياض", type: "return", icon: TrendingUp },
  { date: "12 أغسطس", title: "اكتمال تخصيص مساهمة", detail: "تم تخصيص 150,000 ر.س على أصلين وفق تفضيلاتك", type: "allocation", icon: PieChart },
  { date: "30 يوليو", title: "تحقق أثر جديد", detail: "انتقلت 6 أسر إلى مساكنها وتم اعتماد مستندات التسليم", type: "impact", icon: Home },
] as const;

const positions = [
  { name: "محفظة إسكان الرياض", type: "أصل سكني", value: "552,800 ر.س", returnValue: "+14.8%", share: 40, status: "نشط" },
  { name: "نمو المجتمعات الواعدة", type: "صندوق أثر", value: "485,240 ر.س", returnValue: "+12.4%", share: 35, status: "نشط" },
  { name: "وقف المسكن المستدام", type: "وقف تنموي", value: "348,360 ر.س", returnValue: "+10.9%", share: 25, status: "مستقر" },
] as const;

const documents = [
  { name: "تقرير أثر الربع الثالث", meta: "PDF 2.4 MB", date: "4 سبتمبر 2026" },
  { name: "كشف أداء المحفظة", meta: "PDF 860 KB", date: "31 أغسطس 2026" },
  { name: "شهادة المساهمة السنوية", meta: "PDF 1.1 MB", date: "15 أغسطس 2026" },
] as const;

function DashboardReveal({ children, className = "", delay = 0, id }: { children: ReactNode; className?: string; delay?: number; id?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      id={id}
      initial={{ opacity: 0, y: reduceMotion ? 0 : motionTokens.distance.md }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: reduceMotion ? motionTokens.duration.fast : motionTokens.duration.slow, delay: reduceMotion ? 0 : delay, ease: motionTokens.easing.smooth }}
    >
      {children}
    </motion.div>
  );
}

function DashboardLogo() {
  return (
    <a className="investor-brand" href="/" aria-label="العودة إلى بوابة عائد">
      <img src="/assets/aaid-logo.png" alt="عائد" />
    </a>
  );
}

function SidebarNavigation({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  return (
    <nav className={mobile ? "investor-mobile-links" : "investor-side-links"} aria-label="أقسام لوحة المستثمر">
      <a className="active" href="/investor" onClick={onNavigate}><LayoutDashboard size={18} /> نظرة عامة</a>
      <a href="/wallet" onClick={onNavigate}><WalletCards size={18} /> المحفظة</a>
      <a href="/analysis" onClick={onNavigate}><BrainCircuit size={18} /> تحليل عائد AI</a>
      <a href="/impact" onClick={onNavigate}><Activity size={18} /> رحلة الأثر</a>
      <a href="/documents" onClick={onNavigate}><FileCheck2 size={18} /> المستندات</a>
      <a href="/preferences" onClick={onNavigate}><Settings size={18} /> التفضيلات</a>
    </nav>
  );
}

export function InvestorDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoState] = useState(loadDemoState);
  const localTotal = demoState.contributions.reduce((total, contribution) => total + contribution.amount, 0);
  const localImpact = localTotal / 1_000_000 * 57;
  const overviewMetrics = getOverviewMetrics(localTotal, localImpact);
  const latestContribution = demoState.contributions[0];

  return (
    <div className="investor-page" dir="rtl">
      <header className="investor-topbar">
        <DashboardLogo />
        <div className="investor-search">
          <Search size={17} aria-hidden="true" />
          <label className="sr-only" htmlFor="investor-search">البحث في المحفظة</label>
          <input id="investor-search" type="search" placeholder="ابحث في محفظتك أو تقاريرك" />
          <kbd>⌘ K</kbd>
        </div>
        <div className="investor-account-actions">
          <button className="icon-action notification-action" type="button" aria-label="الإشعارات"><Bell size={19} /><i /></button>
          <span className="topbar-separator" />
          <button className="investor-profile" type="button" aria-label="فتح قائمة الحساب">
            <span>ما</span>
            <strong>محمد العتيبي<small>مستثمر فردي</small></strong>
            <ChevronLeft size={15} />
          </button>
          <button className="icon-action mobile-menu-trigger" type="button" aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}>
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {mobileMenuOpen && (
          <motion.div className="investor-mobile-menu" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: motionTokens.duration.fast }}>
            <SidebarNavigation mobile onNavigate={() => setMobileMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="investor-shell">
        <aside className="investor-sidebar">
          <div>
            <span className="side-caption">مساحة المستثمر</span>
            <SidebarNavigation />
          </div>
          <div className="sidebar-help">
            <span><ShieldCheck size={18} /></span>
            <strong>بياناتك محمية</strong>
            <p>آخر دخول موثّق اليوم 09:42 ص</p>
            <a href="#security">إعدادات الأمان <ArrowLeft size={14} /></a>
          </div>
        </aside>

        <main className="investor-main" id="overview">
          <DashboardReveal className="investor-welcome">
            <div>
              <span className="dashboard-kicker"><i /> آخر تحديث اليوم 10:15 ص</span>
              <h1>صباح الخير محمد</h1>
              <p>هذه صورة محفظتك وأثر مساهماتك حتى هذه اللحظة</p>
            </div>
            <a className="dashboard-primary" href="/start">مساهمة جديدة <ArrowLeft size={17} /></a>
          </DashboardReveal>

          <DashboardReveal className="portfolio-vision" delay={0.04}>
            <div className="vision-copy">
              <span className="vision-status"><i /> منظومة الأثر تعمل الآن</span>
              <p className="vision-overline">محفظة الأثر / AAID IMPACT OS</p>
              <h2>عطاؤك لا يبقى رقمًا<br /><span>يتحوّل إلى أصل حي</span></h2>
              <p className="vision-description">عائد يقرأ مساهماتك يقارن آلاف السيناريوهات ثم يربط نمو الأصل بالأسر التي يصل إليها الأثر — في صورة واحدة مفهومة</p>
              <div className="vision-value"><small>قيمة المحفظة الآن</small><strong>{(1_386_400 + localTotal).toLocaleString("en-US")} <span>ر.س</span></strong><em><TrendingUp size={13} /> +10.9%</em></div>
              <a href="#ai-analysis">شاهد كيف يفكر عائد <ArrowLeft size={16} /></a>
            </div>
            <div className="vision-machine" aria-hidden="true">
              <img src="/assets/aaid-analysis-engine.png" alt="" />
              <span className="vision-core"><i /><b>AI</b></span>
              <span className="vision-node vision-node--money"><CircleDollarSign size={17} /><b>1.25M</b><small>مساهمات</small></span>
              <span className="vision-node vision-node--asset"><Building2 size={17} /><b>3</b><small>أصول نشطة</small></span>
              <span className="vision-node vision-node--families"><Users size={17} /><b>{(71 + localImpact).toFixed(1)}</b><small>أسرة</small></span>
              <svg className="vision-network" viewBox="0 0 600 420" preserveAspectRatio="none">
                <defs><linearGradient id="neuralLine" x1="0" x2="1"><stop stopColor="#1a78c2" stopOpacity=".08" /><stop offset=".5" stopColor="#22b9ca" stopOpacity=".75" /><stop offset="1" stopColor="#1a78c2" stopOpacity=".08" /></linearGradient></defs>
                <g className="network-primary"><path d="M72 96C192 92 214 166 300 210" /><path d="M528 98C415 96 390 170 300 210" /><path d="M520 340C406 332 386 250 300 210" /></g>
                <g className="network-neural">
                  <path d="M300 210C273 168 246 148 212 112" /><path d="M300 210C327 168 354 148 388 112" />
                  <path d="M300 210C247 202 214 211 166 196" /><path d="M300 210C353 202 386 211 434 196" />
                  <path d="M300 210C271 257 247 280 218 322" /><path d="M300 210C329 257 353 280 382 322" />
                  <path d="M212 112C265 120 335 120 388 112" /><path d="M166 196C205 250 210 278 218 322" /><path d="M434 196C395 250 390 278 382 322" />
                </g>
                <g className="network-points"><circle cx="212" cy="112" r="4" /><circle cx="388" cy="112" r="4" /><circle cx="166" cy="196" r="4" /><circle cx="434" cy="196" r="4" /><circle cx="218" cy="322" r="4" /><circle cx="382" cy="322" r="4" /></g>
              </svg>
            </div>
            {latestContribution && <div className="local-proof"><Zap size={14} /><span>آخر تجربة محفوظة محليًا</span><strong>{latestContribution.amount.toLocaleString("en-US")} ر.س</strong><small>{latestContribution.pathTitle}</small></div>}
          </DashboardReveal>

          <DashboardReveal className="overview-grid" delay={0.05}>
            {overviewMetrics.map((metric) => {
              const MetricIcon = metric.icon;
              return (
                <article className={`overview-card overview-card--${metric.tone}`} key={metric.label}>
                  <div className="metric-topline"><span>{metric.label}</span><i><MetricIcon size={19} /></i></div>
                  <strong>{metric.value}<small>{metric.unit}</small></strong>
                  <span className="metric-change">{metric.change}</span>
                </article>
              );
            })}
          </DashboardReveal>

          <DashboardReveal className="smart-brief" delay={0.08}>
            <span className="brief-icon"><Sparkles size={20} /></span>
            <div><strong>ملخص عائد الذكي</strong><p>محفظتك تسير أعلى من المستهدف بـ 1.8% وتوزيع المخاطر ما زال ضمن المستوى المتوازن الذي اخترته</p></div>
            <button type="button">عرض التحليل <ArrowLeft size={15} /></button>
          </DashboardReveal>

          <DashboardReveal className="ai-command" id="ai-analysis">
            <div className="ai-command-header">
              <div><span><BrainCircuit size={17} /> محرك القرار الذكي</span><h2>لماذا يقترح عائد هذا المسار؟</h2><p>توصية قابلة للفهم مبنية على العائد والمخاطر والسيولة والأثر والامتثال — وليست صندوقًا أسود</p></div>
              <div className="ai-live"><i /> تحليل مباشر <small>تم التحديث الآن</small></div>
            </div>
            <div className="ai-command-grid">
              <div className="ai-decision">
                <div className="ai-score-orbit"><span><strong>92</strong><small>/ 100</small></span><i /><i /><i /></div>
                <div className="ai-decision-copy"><span>الفرصة الأنسب لمحفظتك</span><h3>محفظة إسكان الرياض</h3><p>توازن قوي بين عائد مستهدف أعلى من المتوسط واحتياج سكني موثق ومستوى مخاطر يطابق تفضيلاتك</p><div><b><CheckCircle2 size={13} /> ملاءمة مرتفعة</b><b><ShieldCheck size={13} /> اعتماد بشري</b></div></div>
              </div>
              <div className="ai-factor-map">
                {aiFactors.map((factor) => <div key={factor.label}><span><b>{factor.label}</b><small>{factor.detail}</small></span><i><motion.em initial={{ scaleX: 0 }} whileInView={{ scaleX: factor.value / 100 }} viewport={{ once: true }} transition={{ duration: .7, ease: motionTokens.easing.smooth }} /></i><strong>{factor.value}</strong></div>)}
              </div>
              <div className="ai-engine-view" aria-hidden="true"><img src="/assets/aaid-analysis-engine.png" alt="" /><span><Cpu size={20} /><b>6,000+</b><small>سيناريو مقارن</small></span><i className="ai-scan" /></div>
            </div>
            <div className="scenario-strip">
              <div className="scenario-title"><ScanLine size={18} /><span><strong>محاكاة النتيجة</strong><small>خمسة أعوام</small></span></div>
              {aiScenarios.map((scenario) => <article className={`scenario-card scenario-card--${scenario.tone}`} key={scenario.label}><span>{scenario.label}</span><strong>{scenario.returnValue}</strong><small>عائد مستهدف</small><p><Users size={13} /> {scenario.families}</p></article>)}
            </div>
            <div className="ai-sources"><Database size={15} /><span>مصادر التحليل</span><b>بيانات الأصول</b><b>احتياج المناطق</b><b>مؤشرات المخاطر</b><b>تقارير الأثر</b><small>آخر تحديث: اليوم 10:15 ص</small></div>
          </DashboardReveal>

          <div className="dashboard-grid dashboard-grid--primary" id="portfolio">
            <DashboardReveal className="dashboard-panel performance-panel">
              <div className="panel-heading">
                <div><span>أداء المحفظة</span><h2>النمو خلال 12 شهرًا</h2></div>
                <button type="button">آخر 12 شهرًا <ChevronLeft size={14} /></button>
              </div>
              <div className="chart-summary"><strong>1,386,400 <small>ر.س</small></strong><span><TrendingUp size={13} /> 10.9%</span></div>
              <div className="performance-chart" aria-label="رسم توضيحي لنمو قيمة المحفظة خلال اثني عشر شهرًا">
                <svg viewBox="0 0 720 245" preserveAspectRatio="none" role="img">
                  <defs>
                    <linearGradient id="portfolio-area" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#23b8e6" stopOpacity=".25" /><stop offset="1" stopColor="#23b8e6" stopOpacity="0" /></linearGradient>
                    <linearGradient id="portfolio-line" x1="0" x2="1"><stop stopColor="#196ed2" /><stop offset="1" stopColor="#21c6df" /></linearGradient>
                  </defs>
                  <g className="chart-grid-lines"><path d="M0 35H720" /><path d="M0 95H720" /><path d="M0 155H720" /><path d="M0 215H720" /></g>
                  <path className="chart-area" d="M0 198 C70 190 83 174 138 179 S217 159 275 162 S356 129 412 134 S502 104 552 91 S650 70 720 42 L720 245 L0 245 Z" />
                  <motion.path className="chart-line" d="M0 198 C70 190 83 174 138 179 S217 159 275 162 S356 129 412 134 S502 104 552 91 S650 70 720 42" fill="none" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: motionTokens.easing.smooth }} />
                  <circle cx="720" cy="42" r="5" className="chart-last-dot" />
                </svg>
                <div className="chart-months"><span>أكتوبر</span><span>ديسمبر</span><span>فبراير</span><span>أبريل</span><span>يونيو</span><span>سبتمبر</span></div>
              </div>
            </DashboardReveal>

            <DashboardReveal className="dashboard-panel allocation-panel" delay={0.06}>
              <div className="panel-heading"><div><span>توزيع المحفظة</span><h2>حسب نوع الأصل</h2></div><button className="panel-icon-button" type="button" aria-label="المزيد"><MoreHorizontal size={19} /></button></div>
              <div className="allocation-visual">
                <div className="allocation-ring"><div><strong>3</strong><span>أصول</span></div></div>
                <div className="allocation-legend">
                  <span><i className="legend-blue" /><b>أصول سكنية</b><strong>40%</strong></span>
                  <span><i className="legend-cyan" /><b>صناديق أثر</b><strong>35%</strong></span>
                  <span><i className="legend-mint" /><b>أوقاف تنموية</b><strong>25%</strong></span>
                </div>
              </div>
              <div className="risk-band"><ShieldCheck size={17} /><span><strong>مستوى المخاطر: متوازن</strong><small>متوافق مع تفضيلات محفظتك</small></span></div>
            </DashboardReveal>
          </div>

          <div className="dashboard-grid dashboard-grid--details">
            <DashboardReveal className="dashboard-panel timeline-panel" id="impact-timeline">
              <div className="panel-heading"><div><span>المسار الموحد</span><h2>المال يتحول إلى أثر</h2></div><a href="#all-activity">كل النشاط <ArrowLeft size={14} /></a></div>
              <div className="impact-timeline">
                {timelineEvents.map((event) => {
                  const EventIcon = event.icon;
                  return (
                    <article className={`timeline-event timeline-event--${event.type}`} key={`${event.date}-${event.title}`}>
                      <span className="timeline-icon"><EventIcon size={17} /></span>
                      <div><time>{event.date}</time><strong>{event.title}</strong><p>{event.detail}</p></div>
                    </article>
                  );
                })}
              </div>
            </DashboardReveal>

            <DashboardReveal className="dashboard-panel impact-panel" delay={0.06}>
              <div className="panel-heading"><div><span>الأثر السكني</span><h2>توزيع الأسر المستفيدة</h2></div><MapPin size={18} /></div>
              <div className="impact-total"><strong>71</strong><span>أسرة مستفيدة<br />في 4 مناطق</span></div>
              <div className="region-list">
                <span><b>الرياض</b><i><em style={{ width: "86%" }} /></i><strong>31</strong></span>
                <span><b>مكة المكرمة</b><i><em style={{ width: "62%" }} /></i><strong>19</strong></span>
                <span><b>المنطقة الشرقية</b><i><em style={{ width: "45%" }} /></i><strong>13</strong></span>
                <span><b>المدينة المنورة</b><i><em style={{ width: "28%" }} /></i><strong>8</strong></span>
              </div>
              <a className="impact-map-link" href="#impact-map">استعراض خريطة الأثر <ArrowLeft size={15} /></a>
            </DashboardReveal>
          </div>

          <DashboardReveal className="dashboard-panel positions-panel" delay={0.04}>
            <div className="panel-heading"><div><span>الأصول الحالية</span><h2>مراكز المحفظة</h2></div><button type="button">عرض التفاصيل <ArrowLeft size={14} /></button></div>
            <div className="positions-table" role="table" aria-label="مراكز المحفظة الحالية">
              <div className="position-row position-row--head" role="row"><span>الأصل</span><span>القيمة الحالية</span><span>العائد</span><span>التوزيع</span><span>الحالة</span></div>
              {positions.map((position) => (
                <div className="position-row" role="row" key={position.name}>
                  <span className="position-name"><i><Building2 size={17} /></i><b>{position.name}<small>{position.type}</small></b></span>
                  <strong>{position.value}</strong>
                  <span className="positive-value">{position.returnValue}</span>
                  <span className="position-share"><i><em style={{ width: `${position.share}%` }} /></i>{position.share}%</span>
                  <span className="position-status"><i />{position.status}</span>
                </div>
              ))}
            </div>
          </DashboardReveal>

          <div className="dashboard-grid dashboard-grid--bottom">
            <DashboardReveal className="dashboard-panel documents-panel" id="documents">
              <div className="panel-heading"><div><span>مركز المستندات</span><h2>أحدث الملفات</h2></div><a href="#all-documents">كل المستندات <ArrowLeft size={14} /></a></div>
              <div className="document-list">
                {documents.map((document) => (
                  <article key={document.name}>
                    <span className="document-icon"><FileCheck2 size={18} /></span>
                    <div><strong>{document.name}</strong><small>{document.meta} {document.date}</small></div>
                    <button type="button" aria-label={`تنزيل ${document.name}`}><Download size={17} /></button>
                  </article>
                ))}
              </div>
            </DashboardReveal>

            <DashboardReveal className="dashboard-panel alerts-panel" delay={0.06} id="preferences">
              <div className="panel-heading"><div><span>تنبيهات ذكية</span><h2>ما يحتاج انتباهك</h2></div><span className="alert-count">2 جديد</span></div>
              <article><span className="alert-icon alert-icon--blue"><CalendarDays size={17} /></span><div><strong>تقرير دوري جاهز للمراجعة</strong><p>تم إصدار تقرير أداء محفظتك للربع الثالث</p></div><ChevronLeft size={16} /></article>
              <article><span className="alert-icon alert-icon--mint"><Users size={17} /></span><div><strong>أثر جديد تم التحقق منه</strong><p>أضيفت 8 أسر إلى إجمالي أثر محفظتك</p></div><ChevronLeft size={16} /></article>
              <button className="alerts-action" type="button">إدارة تفضيلات التنبيه</button>
            </DashboardReveal>
          </div>

          <footer className="investor-footer">
            <span>© 2026 عائد بيانات نموذجية للعرض</span>
            <div><a href="#privacy">الخصوصية</a><a href="#support">الدعم</a><a href="/">بوابة عائد</a></div>
          </footer>
        </main>
      </div>
    </div>
  );
}
