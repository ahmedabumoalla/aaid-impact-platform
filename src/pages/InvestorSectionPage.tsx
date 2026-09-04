import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Bell,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronLeft,
  Database,
  Download,
  FileCheck2,
  FileText,
  Gauge,
  HandHeart,
  MapPin,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { InvestorWorkspaceNav, type WorkspacePage } from "../components/InvestorWorkspaceNav";
import { loadDemoState } from "../lib/demo-storage";
import { motionTokens } from "../lib/motion-tokens";
import "./wallet-dashboard.css";
import "./investor-sections.css";

type SectionPage = Exclude<WorkspacePage, "overview" | "wallet">;

const pageCopy: Record<SectionPage, { eyebrow: string; title: string; description: string }> = {
  analysis: { eyebrow: "قراءة المحفظة", title: "تحليل عائد", description: "حرّك الافتراضات وشاهد كيف تتغيّر قراءة العائد والمخاطر والأثر في اللحظة نفسها" },
  impact: { eyebrow: "الأثر المتراكم", title: "رحلة الأثر", description: "من أول ريال دخل المحفظة إلى الأسرة التي وصل إليها السكن في مسار يمكن تتبعه" },
  documents: { eyebrow: "مركز المعرفة", title: "المستندات", description: "كل كشف وتقرير وشهادة في مكان واحد مع حالة المراجعة والإصدار" },
  preferences: { eyebrow: "ضبط التجربة", title: "التفضيلات", description: "تحكم في المخاطر والإشعارات وطريقة عرض الأثر واحفظها مباشرة لهذا النموذج" },
};

const documentRows = [
  { name: "تقرير أثر الربع الثالث", type: "تقرير أثر", date: "4 سبتمبر 2026", size: "2.4 MB", status: "معتمد" },
  { name: "كشف أداء المحفظة", type: "كشف مالي", date: "31 أغسطس 2026", size: "860 KB", status: "جديد" },
  { name: "شهادة المساهمة السنوية", type: "شهادة", date: "15 أغسطس 2026", size: "1.1 MB", status: "معتمد" },
  { name: "ملخص التخصيص الاستثماري", type: "استثمار", date: "12 أغسطس 2026", size: "740 KB", status: "معتمد" },
] as const;

function SectionReveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={{ opacity: 0, y: reduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .5, delay: reduced ? 0 : delay, ease: motionTokens.easing.smooth }}>{children}</motion.div>;
}

function AnalysisExperience({ localTotal }: { localTotal: number }) {
  const [years, setYears] = useState(5);
  const [risk, setRisk] = useState<"محافظ" | "متوازن" | "نمو">("متوازن");
  const riskDelta = risk === "محافظ" ? -2.1 : risk === "نمو" ? 2.4 : 0;
  const returnRate = 14.8 + riskDelta + (years - 5) * .32;
  const baseValue = 1_386_400 + localTotal;
  const projected = baseValue * Math.pow(1 + returnRate / 100, years);
  const families = 71 + localTotal / 1_000_000 * 57 + years * (risk === "محافظ" ? 6 : risk === "نمو" ? 10 : 8);
  const score = Math.max(72, Math.min(97, Math.round(92 - Math.abs(years - 5) * 2 + (risk === "متوازن" ? 2 : -3))));

  return <>
    <SectionReveal className="section-analysis-stage">
      <div className="analysis-narrative"><span><Sparkles size={16} /> القراءة الحالية</span><h2>المحفظة قادرة على النمو بهدوء من غير أن تخسر هدفها الاجتماعي</h2><p>التوازن الحالي مناسب لمدة {years} سنوات لأن دخل الأصول السكنية يغطي التذبذب المتوقع ويترك مساحة لإعادة الاستثمار بينما يصل الأثر التقديري إلى {families.toFixed(0)} أسرة</p><div><strong>{score}<small>/100</small></strong><span>درجة الملاءمة<br />وفق اختياراتك</span></div></div>
      <div className="analysis-controls">
        <label><span>مدة الاستثمار <b>{years} سنوات</b></span><input type="range" min="3" max="8" value={years} onChange={(event) => setYears(Number(event.target.value))} /></label>
        <fieldset><legend>ميل المخاطر</legend><div>{(["محافظ", "متوازن", "نمو"] as const).map((value) => <button className={risk === value ? "active" : ""} type="button" onClick={() => setRisk(value)} key={value}>{value}</button>)}</div></fieldset>
        <div className="analysis-result"><span><TrendingUp size={17} /> العائد المستهدف<strong>{returnRate.toFixed(1)}%</strong></span><span><Gauge size={17} /> القيمة المتوقعة<strong>{Math.round(projected).toLocaleString("en-US")} <small>ر.س</small></strong></span><span><Users size={17} /> الأثر المتوقع<strong>{families.toFixed(0)} <small>أسرة</small></strong></span></div>
      </div>
    </SectionReveal>
    <SectionReveal className="section-card scenario-lab" delay={.08}><div className="section-card-head"><div><span>مختبر السيناريوهات</span><h2>نفس المحفظة تحت ثلاثة احتمالات</h2></div><RefreshCw size={18} /></div><div className="scenario-lanes">{[-3.2, 0, 3.1].map((delta, index) => { const rate = returnRate + delta; return <article className={index === 1 ? "active" : ""} key={delta}><small>{["ضغط السوق", "المسار المرجح", "فرصة نمو"][index]}</small><strong>{rate.toFixed(1)}%</strong><span>{Math.round(baseValue * Math.pow(1 + rate / 100, years)).toLocaleString("en-US")} ر.س</span><i><em style={{ width: `${Math.min(96, 54 + index * 18)}%` }} /></i></article>; })}</div></SectionReveal>
    <SectionReveal className="analysis-data-ribbon" delay={.12}><Database size={17} /><div><strong>قاعدة القراءة</strong><span>بيانات المحفظة المحلية أداء الأصول مدة الاستثمار تفضيل المخاطر قياس الأثر</span></div><b>محسوب الآن</b></SectionReveal>
  </>;
}

function ImpactExperience({ localTotal }: { localTotal: number }) {
  const families = 71 + localTotal / 1_000_000 * 57;
  const regions = [{ name: "الرياض", value: 31, x: 58, y: 42 }, { name: "مكة", value: 19, x: 35, y: 67 }, { name: "الشرقية", value: 13, x: 76, y: 55 }, { name: "المدينة", value: 8, x: 39, y: 43 }];
  return <>
    <SectionReveal className="section-impact-stage"><div className="impact-story"><span>الأثر حتى اليوم</span><h2>{families.toFixed(1)} <small>أسرة</small></h2><p>كل نقطة على الخريطة بدأت بمساهمة وتحولت إلى أصل ثم عائد ثم سكن يمكن التحقق منه</p><div><b>4 مناطق</b><b>3 أصول</b><b>12 تقريرًا</b></div></div><div className="impact-map"><div className="map-orbit" />{regions.map((region) => <span style={{ left: `${region.x}%`, top: `${region.y}%` }} key={region.name}><i /><strong>{region.value}</strong><small>{region.name}</small></span>)}</div></SectionReveal>
    <SectionReveal className="section-card impact-flow" delay={.08}><div className="section-card-head"><div><span>من المال إلى السكن</span><h2>مسار موثّق لا ينقطع</h2></div><HandHeart size={19} /></div><div>{[{ icon: "01", title: "المساهمة", value: `${(1_250_000 + localTotal).toLocaleString("en-US")} ر.س` },{ icon: "02", title: "تخصيص الأصول", value: "3 فرص نشطة" },{ icon: "03", title: "العائد المتحقق", value: "136,400 ر.س" },{ icon: "04", title: "الوصول للأسر", value: `${families.toFixed(0)} أسرة` }].map((item) => <article key={item.icon}><b>{item.icon}</b><span>{item.title}<strong>{item.value}</strong></span><ChevronLeft size={16} /></article>)}</div></SectionReveal>
  </>;
}

function DocumentsExperience() {
  const [query, setQuery] = useState("");
  const rows = documentRows.filter((row) => row.name.includes(query) || row.type.includes(query));
  return <><SectionReveal className="document-command"><div><span>وثائق جاهزة</span><strong>12</strong><small>4 جديدة هذا الربع</small></div><div><span>مراجعات مكتملة</span><strong>100%</strong><small>لا توجد ملفات معلقة</small></div><button type="button"><Upload size={17} /> رفع مستند</button></SectionReveal><SectionReveal className="section-card document-center" delay={.06}><div className="section-card-head"><div><span>أرشيف المحفظة</span><h2>كل الملفات</h2></div><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم الملف أو نوعه" /></label></div><div className="document-table">{rows.map((row) => <article key={row.name}><span><FileText size={18} /></span><div><strong>{row.name}</strong><small>{row.type}</small></div><time>{row.date}</time><b>{row.size}</b><em>{row.status}</em><button type="button" aria-label={`تنزيل ${row.name}`}><Download size={16} /></button></article>)}</div></SectionReveal></>;
}

function PreferencesExperience() {
  const stored = typeof window === "undefined" ? null : window.localStorage.getItem("aaid-investor-preferences");
  const initial = stored ? JSON.parse(stored) as { alerts: boolean; reports: boolean; impact: boolean; risk: string } : { alerts: true, reports: true, impact: true, risk: "متوازن" };
  const [preferences, setPreferences] = useState(initial);
  const [saved, setSaved] = useState(false);
  const update = (key: string, value: boolean | string) => { setPreferences((current) => ({ ...current, [key]: value })); setSaved(false); };
  const save = () => { window.localStorage.setItem("aaid-investor-preferences", JSON.stringify(preferences)); setSaved(true); };
  return <div className="preferences-grid"><SectionReveal className="section-card"><div className="section-card-head"><div><span>ملف الاستثمار</span><h2>درجة المخاطر المفضلة</h2></div><SlidersHorizontal size={18} /></div><div className="risk-options">{["محافظ", "متوازن", "نمو"].map((risk) => <button className={preferences.risk === risk ? "active" : ""} onClick={() => update("risk", risk)} type="button" key={risk}><span><Gauge size={18} /></span><strong>{risk}</strong><small>{risk === "محافظ" ? "ثبات أعلى وتذبذب أقل" : risk === "نمو" ? "فرص أكبر وتذبذب أعلى" : "مزيج مدروس بين الاثنين"}</small></button>)}</div></SectionReveal><SectionReveal className="section-card" delay={.06}><div className="section-card-head"><div><span>الإشعارات</span><h2>ما الذي تريد معرفته؟</h2></div><Bell size={18} /></div><div className="preference-switches">{[["alerts","حركات المحفظة","عند إيداع مساهمة أو تخصيصها"],["reports","التقارير الجديدة","عندما يصبح كشف أو تقرير جاهزًا"],["impact","تحديثات الأثر","عند توثيق أسرة أو أثر جديد"]].map(([key,title,description]) => <label key={key}><span><strong>{title}</strong><small>{description}</small></span><input type="checkbox" checked={Boolean(preferences[key as keyof typeof preferences])} onChange={(event) => update(key,event.target.checked)} /><i /></label>)}</div></SectionReveal><SectionReveal className="preference-save" delay={.1}><div>{saved ? <CheckCircle2 size={18} /> : <Settings size={18} />}<span><strong>{saved ? "تم حفظ تفضيلاتك" : "التغييرات جاهزة"}</strong><small>تُحفظ محليًا لهذا العرض التجريبي</small></span></div><button type="button" onClick={save}>حفظ التفضيلات</button></SectionReveal></div>;
}

export function InvestorSectionPage({ page }: { page: SectionPage }) {
  const [demoState] = useState(loadDemoState);
  const localTotal = demoState.contributions.reduce((sum, item) => sum + item.amount, 0);
  const copy = pageCopy[page];
  return <div className="section-page" dir="rtl"><header className="section-topbar"><a href="/"><img src="/assets/aaid-logo.webp" alt="عائد" decoding="async" /></a><div><Search size={16} /><span>ابحث في مساحة المستثمر</span></div><a href="/start">مساهمة جديدة <ArrowLeft size={15} /></a></header><div className="section-layout"><InvestorWorkspaceNav active={page} /><main className="section-main"><SectionReveal className="section-intro"><div><span>{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.description}</p></div><aside><ShieldCheck size={17} /><span>بيانات التجربة محفوظة محليًا</span></aside></SectionReveal>{page === "analysis" && <AnalysisExperience localTotal={localTotal} />}{page === "impact" && <ImpactExperience localTotal={localTotal} />}{page === "documents" && <DocumentsExperience />}{page === "preferences" && <PreferencesExperience />}</main></div></div>;
}
