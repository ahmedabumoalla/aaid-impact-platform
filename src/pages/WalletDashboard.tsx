import { useState, type ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
  HandHeart,
  Landmark,
  LineChart,
  PieChart,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { loadDemoState, type DemoContribution } from "../lib/demo-storage";
import { motionTokens } from "../lib/motion-tokens";
import { InvestorWorkspaceNav } from "../components/InvestorWorkspaceNav";
import "./wallet-dashboard.css";

type TransactionKind = "in" | "out" | "return";

type WalletTransaction = {
  id: string;
  title: string;
  detail: string;
  date: string;
  amount: number;
  kind: TransactionKind;
};

const baseTransactions: WalletTransaction[] = [
  { id: "return-sep", title: "عائد دوري", detail: "محفظة إسكان الرياض", date: "1 سبتمبر 2026", amount: 24_600, kind: "return" },
  { id: "reinvest-aug", title: "إعادة استثمار", detail: "نمو المجتمعات الواعدة", date: "28 أغسطس 2026", amount: -18_000, kind: "out" },
  { id: "contribution-aug", title: "مساهمة جديدة", detail: "تحويل بنكي موثّق", date: "12 أغسطس 2026", amount: 150_000, kind: "in" },
  { id: "allocation-jul", title: "تخصيص استثماري", detail: "وقف المسكن المستدام", date: "30 يوليو 2026", amount: -120_000, kind: "out" },
  { id: "return-jul", title: "عائد أصل سكني", detail: "دفعة الربع الثاني", date: "18 يوليو 2026", amount: 17_850, kind: "return" },
] as const;

const positions = [
  { name: "محفظة إسكان الرياض", type: "أصل سكني", invested: 500_000, current: 552_800, returnRate: 14.8, share: 40, color: "#146fd1" },
  { name: "نمو المجتمعات الواعدة", type: "صندوق أثر", invested: 440_000, current: 485_240, returnRate: 12.4, share: 35, color: "#13a9c9" },
  { name: "وقف المسكن المستدام", type: "وقف تنموي", invested: 310_000, current: 348_360, returnRate: 10.9, share: 25, color: "#20a587" },
] as const;

const monthlyValues = [1_188_000, 1_204_500, 1_226_300, 1_241_800, 1_267_000, 1_282_600, 1_311_900, 1_326_200, 1_351_700, 1_386_400] as const;

function formatMoney(value: number) {
  return Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function contributionToTransaction(contribution: DemoContribution): WalletTransaction {
  return {
    id: contribution.id,
    title: "مساهمة تجريبية",
    detail: `${contribution.opportunityTitle} ${contribution.pathTitle}`,
    date: new Intl.DateTimeFormat("ar-SA", { day: "numeric", month: "long", year: "numeric" }).format(new Date(contribution.createdAt)),
    amount: contribution.amount,
    kind: "in",
  };
}

function WalletReveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : .55, delay: reducedMotion ? 0 : delay, ease: motionTokens.easing.smooth }}
    >
      {children}
    </motion.div>
  );
}

export function WalletDashboard() {
  const [demoState] = useState(loadDemoState);
  const [filter, setFilter] = useState<"all" | TransactionKind>("all");
  const localTotal = demoState.contributions.reduce((sum, item) => sum + item.amount, 0);
  const totalPrincipal = 1_250_000 + localTotal;
  const realizedReturns = 136_400 + localTotal * .15;
  const portfolioValue = 1_386_400 + localTotal;
  const availableBalance = 86_400 + localTotal;
  const investedBalance = portfolioValue - availableBalance;
  const impactFamilies = 71 + (localTotal / 1_000_000) * 57;
  const allTransactions = [...demoState.contributions.map(contributionToTransaction), ...baseTransactions];
  const visibleTransactions = filter === "all" ? allTransactions : allTransactions.filter((item) => item.kind === filter);
  const chartPoints = monthlyValues.map((value, index) => {
    const adjusted = index === monthlyValues.length - 1 ? value + localTotal : value;
    const x = index * (720 / (monthlyValues.length - 1));
    const min = 1_150_000;
    const max = 1_420_000 + localTotal;
    const y = 205 - ((adjusted - min) / (max - min)) * 165;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <div className="wallet-page" dir="rtl">
      <header className="wallet-topbar">
        <a className="wallet-logo" href="/" aria-label="بوابة عائد"><img src="/assets/aaid-logo.webp" alt="عائد" decoding="async" /></a>
        <nav aria-label="تنقل المحفظة"><a href="/investor/dashboard">لوحة المستثمر</a><a className="active" href="/wallet">المحفظة</a><a href="#transactions">العمليات</a></nav>
        <a className="wallet-back" href="/investor">العودة للوحة <ChevronLeft size={15} /></a>
      </header>

      <div className="wallet-layout">
      <InvestorWorkspaceNav active="wallet" />
      <main className="wallet-main">
        <WalletReveal className="wallet-balance-stage">
          <div className="wallet-balance-copy">
            <span className="wallet-kicker"><i /> محفظتك محدّثة حتى هذه اللحظة</span>
            <p>القيمة الإجمالية للمحفظة</p>
            <h1>{formatMoney(portfolioValue)} <small>ر.س</small></h1>
            <div className="wallet-growth"><TrendingUp size={15} /><strong>10.9%</strong><span>نمو منذ بداية المحفظة</span></div>
            <div className="wallet-hero-actions"><a href="/start"><Plus size={16} /> مساهمة جديدة</a><button type="button"><Download size={16} /> تنزيل الكشف</button></div>
          </div>

          <div className="capital-route" aria-label="توزيع قيمة المحفظة">
            <div className="route-heading"><span><Sparkles size={15} /> حركة رأس المال</span><small>قراءة فورية</small></div>
            <div className="route-track"><i /><i /><i /></div>
            <div className="route-stops">
              <article><span><WalletCards size={18} /></span><small>رصيد متاح</small><strong>{formatMoney(availableBalance)}</strong><em>ر.س</em></article>
              <article><span><Landmark size={18} /></span><small>قيمة مستثمرة</small><strong>{formatMoney(investedBalance)}</strong><em>ر.س</em></article>
              <article><span><HandHeart size={18} /></span><small>الأثر المتحقق</small><strong>{impactFamilies.toFixed(1)}</strong><em>أسرة</em></article>
            </div>
            <div className="route-note"><CheckCircle2 size={15} /><span>كل مبلغ ظاهر هنا محسوب من سجل المحفظة المحلي</span><time>الآن</time></div>
          </div>
        </WalletReveal>

        <WalletReveal className="wallet-metric-row" delay={.05}>
          <article><span><CircleDollarSign size={18} /></span><div><small>إجمالي المساهمات</small><strong>{formatMoney(totalPrincipal)} <em>ر.س</em></strong></div><b>+12.4%</b></article>
          <article><span><TrendingUp size={18} /></span><div><small>العوائد المتحققة</small><strong>{formatMoney(realizedReturns)} <em>ر.س</em></strong></div><b>{((realizedReturns / totalPrincipal) * 100).toFixed(1)}%</b></article>
          <article><span><RefreshCw size={18} /></span><div><small>أعيد استثماره</small><strong>45,000 <em>ر.س</em></strong></div><b>33%</b></article>
          <article><span><ShieldCheck size={18} /></span><div><small>حالة التسويات</small><strong>مكتملة</strong></div><b>100%</b></article>
        </WalletReveal>

        <div className="wallet-analysis-grid">
          <WalletReveal className="wallet-panel wallet-performance" delay={.08}>
            <div className="wallet-panel-heading"><div><span>تحليل القيمة</span><h2>المحفظة تنمو بثبات</h2></div><button type="button"><CalendarDays size={14} /> 10 أشهر</button></div>
            <div className="wallet-chart-summary"><strong>+{formatMoney(portfolioValue - monthlyValues[0])} <small>ر.س</small></strong><p>نمو صافٍ في قيمة الأصول خلال الفترة</p></div>
            <div className="wallet-line-chart">
              <svg viewBox="0 0 720 230" preserveAspectRatio="none" role="img" aria-label="نمو قيمة المحفظة خلال عشرة أشهر">
                <defs><linearGradient id="walletArea" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#159aca" stopOpacity=".22" /><stop offset="1" stopColor="#159aca" stopOpacity="0" /></linearGradient></defs>
                <path className="wallet-grid-line" d="M0 45H720M0 100H720M0 155H720M0 210H720" />
                <polygon points={`0,220 ${chartPoints} 720,220`} fill="url(#walletArea)" />
                <motion.polyline points={chartPoints} fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: motionTokens.easing.smooth }} />
              </svg>
              <div><span>ديسمبر</span><span>فبراير</span><span>أبريل</span><span>يونيو</span><span>سبتمبر</span></div>
            </div>
          </WalletReveal>

          <WalletReveal className="wallet-panel wallet-return-reading" delay={.12}>
            <div className="wallet-panel-heading"><div><span>قراءة العوائد</span><h2>ما الذي صنع النمو؟</h2></div><LineChart size={19} /></div>
            <div className="return-spotlight"><span>صافي العائد</span><strong>{((realizedReturns / totalPrincipal) * 100).toFixed(1)}%</strong><small>أعلى من خط الأساس بـ 1.8%</small></div>
            <div className="return-drivers">
              <span><b>دخل الأصول</b><i><em style={{ width: "82%" }} /></i><strong>58%</strong></span>
              <span><b>نمو التقييم</b><i><em style={{ width: "59%" }} /></i><strong>29%</strong></span>
              <span><b>إعادة الاستثمار</b><i><em style={{ width: "38%" }} /></i><strong>13%</strong></span>
            </div>
            <p><Sparkles size={14} /> الجزء الأكبر من النمو جاء من دخل الأصول السكنية مع استقرار واضح في التقييم</p>
          </WalletReveal>
        </div>

        <WalletReveal className="wallet-panel wallet-positions" delay={.1}>
          <div className="wallet-panel-heading"><div><span>الاستثمارات</span><h2>أين تعمل أموالك الآن؟</h2></div><a href="/start">إضافة استثمار <ArrowLeft size={14} /></a></div>
          <div className="wallet-position-head"><span>الاستثمار</span><span>القيمة الحالية</span><span>العائد</span><span>حصة المحفظة</span><span>الحالة</span></div>
          {positions.map((position, index) => {
            const current = position.current + (index === 0 ? localTotal : 0);
            return <article className="wallet-position-row" key={position.name}>
              <div className="wallet-position-name"><span style={{ color: position.color }}><Building2 size={18} /></span><div><strong>{position.name}</strong><small>{position.type} منذ 2024</small></div></div>
              <strong>{formatMoney(current)} <small>ر.س</small></strong>
              <b>+{position.returnRate}%</b>
              <div className="wallet-share"><i><em style={{ width: `${position.share}%`, background: position.color }} /></i><span>{position.share}%</span></div>
              <span className="wallet-status"><i /> يعمل</span>
            </article>;
          })}
        </WalletReveal>

        <div className="wallet-bottom-grid">
          <WalletReveal className="wallet-panel wallet-transactions" delay={.1}>
            <div className="wallet-panel-heading" id="transactions"><div><span>السجل المالي</span><h2>المدفوعات والحركات</h2></div><button type="button"><Download size={14} /> تصدير</button></div>
            <div className="transaction-filters" aria-label="تصفية العمليات">
              {([['all', 'الكل'], ['in', 'مساهمات'], ['return', 'عوائد'], ['out', 'استثمارات']] as const).map(([value, label]) => <button className={filter === value ? "active" : ""} type="button" key={value} onClick={() => setFilter(value)}>{label}</button>)}
            </div>
            <div className="transaction-list">
              {visibleTransactions.map((transaction) => {
                const Icon = transaction.kind === "return" ? TrendingUp : transaction.kind === "in" ? ArrowDownLeft : ArrowUpRight;
                return <article key={transaction.id}><span className={`transaction-icon transaction-icon--${transaction.kind}`}><Icon size={17} /></span><div><strong>{transaction.title}</strong><small>{transaction.detail} {transaction.date}</small></div><b className={transaction.amount > 0 ? "positive" : "negative"}>{transaction.amount > 0 ? "+" : "−"}{formatMoney(transaction.amount)} <small>ر.س</small></b><span className="transaction-state"><CheckCircle2 size={13} /> مكتملة</span></article>;
              })}
            </div>
          </WalletReveal>

          <WalletReveal className="wallet-panel wallet-payment-health" delay={.14}>
            <div className="wallet-panel-heading"><div><span>سلامة التدفق</span><h2>كل شيء تحت السيطرة</h2></div><ShieldCheck size={19} /></div>
            <div className="health-ring"><div><strong>96</strong><small>/ 100</small></div></div>
            <div className="health-copy"><strong>تدفق مالي صحي</strong><p>لا توجد دفعات معلقة أو تسويات متأخرة في السجل الحالي</p></div>
            <div className="health-checks"><span><CheckCircle2 size={14} /> التسويات مكتملة</span><span><CreditCard size={14} /> وسائل الدفع سليمة</span><span><Clock3 size={14} /> آخر حركة اليوم</span></div>
            <div className="wallet-disclaimer"><BarChart3 size={14} /> الأرقام الحالية مخصصة لتجربة الـMVP وتحسب من بيانات العرض والسجل المحلي</div>
          </WalletReveal>
        </div>
      </main>
      </div>
    </div>
  );
}
