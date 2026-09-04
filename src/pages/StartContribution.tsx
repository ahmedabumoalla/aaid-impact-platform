import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
  HandHeart,
  Home,
  Info,
  Landmark,
  Leaf,
  Lightbulb,
  LockKeyhole,
  MapPin,
  Pencil,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { formatSar } from "../lib/impact";
import { loadDemoState, recordDemoContribution, saveContributionDraft } from "../lib/demo-storage";
import { motionTokens } from "../lib/motion-tokens";
import { contributionOpportunities } from "../data/contribution-opportunities";
import "./start-contribution.css";

const contributionValues = [500, 1_000, 5_000, 10_000] as const;

const opportunities = contributionOpportunities.map((opportunity) => ({
  ...opportunity,
  type: opportunity.subtitle,
  progress: opportunity.funded,
}));

const paths = [
  { id: "balanced", title: "مساكن الأسر الأشد احتياجًا", badge: "الفرصة الموصى بها", category: "سكني", description: "مشروع يهدف إلى توفير وحدات سكنية للأسر الأكثر احتياجًا في مناطق مختلفة من الرياض", returnValue: "6%", impact: "120 مستفيد", risk: "مرتفع", image: "/assets/aaid-riyadh-central-residence.png", imageAlt: "مشروع مساكن الأسر الأشد احتياجًا في الرياض", icon: Sparkles },
  { id: "impact", title: "تطوير الأحياء السكنية", badge: "تطوير", category: "تنموي", description: "المساهمة في تطوير البنية التحتية والخدمات في الأحياء السكنية", returnValue: "5%", impact: "300 مستفيد", risk: "متوسط", image: "/assets/aaid-riyadh-west-townhomes.png", imageAlt: "مشروع تطوير الأحياء السكنية في الرياض", icon: HandHeart },
  { id: "growth", title: "صندوق الفرص السكنية", badge: "استثماري", category: "صندوق أثر", description: "صندوق استثماري لدعم المبادرات السكنية المستدامة في مدينة الرياض", returnValue: "4%", impact: "500 مستفيد", risk: "مرتفع", image: "/assets/aaid-riyadh-east-apartments.png", imageAlt: "صندوق الفرص السكنية في الرياض", icon: TrendingUp },
] as const;

const steps = ["المبلغ", "المسار", "التأكيد"] as const;

function StartLogo() {
  return <a className="start-brand" href="/" aria-label="العودة إلى بوابة عائد"><img src="/assets/aaid-logo.png" alt="عائد" /></a>;
}

export function StartContribution() {
  const reduceMotion = useReducedMotion();
  const [initialDraft] = useState(() => loadDemoState().draft);
  const [requestedOpportunityId] = useState(() => new URLSearchParams(window.location.search).get("opportunity"));
  const hasRequestedOpportunity = opportunities.some((item) => item.id === requestedOpportunityId);
  const isDifferentOpportunity = hasRequestedOpportunity && requestedOpportunityId !== initialDraft?.opportunityId;
  const [step, setStep] = useState(!isDifferentOpportunity && initialDraft && initialDraft.step < 3 ? initialDraft.step : 0);
  const [amount, setAmount] = useState(initialDraft?.amount ?? 5_000);
  const [customAmount, setCustomAmount] = useState(initialDraft?.customAmount ?? "");
  const [opportunityId] = useState<(typeof opportunities)[number]["id"]>(() => {
    if (hasRequestedOpportunity) return requestedOpportunityId!;
    if (opportunities.some((item) => item.id === initialDraft?.opportunityId)) return initialDraft!.opportunityId;
    return opportunities[0].id;
  });
  const [pathId, setPathId] = useState<(typeof paths)[number]["id"]>(() => paths.some((item) => item.id === initialDraft?.pathId) ? initialDraft!.pathId as (typeof paths)[number]["id"] : "balanced");
  const [paymentMethod, setPaymentMethod] = useState(initialDraft?.paymentMethod ?? "mada");
  const [accepted, setAccepted] = useState(initialDraft?.accepted ?? false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [completion, setCompletion] = useState<{ id: string; createdAt: string } | null>(null);
  const detailsButtonRef = useRef<HTMLButtonElement>(null);

  const opportunity = opportunities.find((item) => item.id === opportunityId) ?? opportunities[0];
  const selectedPath = paths.find((item) => item.id === pathId)!;
  const alternatePaths = paths.filter((item) => item.id !== pathId);
  const annualReturn = amount * 0.15;
  const reinvested = amount * 0.045;
  const families = amount / 1_000_000 * 57;
  const canContinue = step !== 2 || accepted;
  const supportedFamilies = Math.max(1, Math.round(amount / 3_500));
  const reducedEmissions = Math.max(1, Math.round(amount / 850));
  const pathBeneficiaries = Number.parseInt(selectedPath.impact, 10);
  const projectedFamilies = [0.08, 0.3, 0.65, 1].map((share) => Math.max(1, Math.round(pathBeneficiaries * share)));

  useEffect(() => {
    saveContributionDraft({ step, amount, customAmount, opportunityId, pathId, paymentMethod, accepted });
  }, [step, amount, customAmount, opportunityId, pathId, paymentMethod, accepted]);

  const choosePresetAmount = (value: number) => {
    setAmount(value);
    setCustomAmount("");
  };

  const updateCustomAmount = (value: string) => {
    const normalized = value.replace(/[^0-9]/g, "");
    setCustomAmount(normalized);
    if (normalized) setAmount(Math.max(100, Number(normalized)));
  };

  const goNext = () => {
    if (!canContinue) return;
    if (step === 2) {
      const id = `AAID-${Date.now()}`;
      const createdAt = new Date().toISOString();
      recordDemoContribution({
        id,
        amount,
        opportunityId,
        opportunityTitle: opportunity.title,
        pathId,
        pathTitle: selectedPath.title,
        createdAt,
      });
      setCompletion({ id, createdAt });
    }
    setStep((current) => Math.min(current + 1, steps.length));
  };

  const goBack = () => setStep((current) => Math.max(current - 1, 0));

  const closeDetails = () => {
    setDetailsOpen(false);
    window.requestAnimationFrame(() => detailsButtonRef.current?.focus());
  };

  const downloadReceipt = () => {
    const receiptNumber = completion?.id ?? "AAID-2453";
    const receiptTime = formatCompletionTime(completion?.createdAt);
    const receipt = [
      "إيصال مساهمة تجريبية",
      `رقم المساهمة ${receiptNumber}`,
      `قيمة المساهمة ${formatSar(amount)}`,
      `المسار الاستثماري ${selectedPath.title}`,
      `التاريخ والوقت ${receiptTime}`,
      "هذه تجربة نموذج أولي ولم يتم خصم أي مبلغ",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([receipt], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${receiptNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`start-page start-page--step-${step}`} dir="rtl">
      <header className="start-header">
        <StartLogo />
        <div className="start-header-note"><LockKeyhole size={15} /><span>تجربة آمنة ومشفرة</span></div>
        <a href="/" className="start-close">العودة للمنصة <ArrowLeft size={15} /></a>
      </header>

      <main className="start-main">
        {step < 3 && (
          <div className="start-intro">
            <span>مساهمة تصنع أثرًا مستدامًا</span>
            <h1>ابدأ مساهمتك</h1>
            <p>الخطوة {step + 1} من 3</p>
            <div className="start-progress" aria-label={"الخطوة " + (step + 1) + " من " + steps.length}>
              {steps.map((label, index) => (
                <div className={index === step ? "active" : index < step ? "complete" : ""} key={label}>
                  <span aria-hidden="true">{index < step ? <Check size={13} /> : index + 1}</span>
                  <strong>{label}</strong>
                  {index < steps.length - 1 && <i><em /></i>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="start-layout">
          <section className="start-flow" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                className="start-step"
                key={step}
                initial={{ opacity: 0, x: reduceMotion ? 0 : 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduceMotion ? 0 : -18 }}
                transition={{ duration: reduceMotion ? motionTokens.duration.fast : motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
              >
                {step === 0 && (
                  <>
                    <article className="start-selected-opportunity">
                      <img src={opportunity.image} alt={opportunity.imageAlt} />
                      <div>
                        <span className={`selected-opportunity-status ${opportunity.status === "قيد التمويل" ? "is-funding" : ""}`}>{opportunity.status}</span>
                        <h2>{opportunity.title}</h2>
                        <p>{opportunity.type}</p>
                        <div className="selected-opportunity-numbers"><span>الهدف <strong>{opportunity.target} ر.س</strong></span><span>تم جمع <strong>{opportunity.progress}%</strong></span></div>
                        <div className="funding-progress" role="progressbar" aria-label="نسبة تمويل الفرصة" aria-valuenow={opportunity.progress} aria-valuemin={0} aria-valuemax={100}><span><em style={{ width: opportunity.progress + "%" }} /></span></div>
                      </div>
                    </article>

                    <div className="start-step-heading">
                      <h1>اختر قيمة مساهمتك</h1>
                    </div>

                    <fieldset className="amount-fieldset">
                      <legend>قيمة المساهمة</legend>
                      <div className="amount-options">
                        {contributionValues.map((value) => (
                          <button className={amount === value && !customAmount ? "selected" : ""} type="button" onClick={() => choosePresetAmount(value)} key={value}>
                            {amount === value && !customAmount && <CheckCircle2 size={17} />}
                            <strong>{value.toLocaleString("ar-SA")}</strong><span>ر.س</span>
                          </button>
                        ))}
                      </div>
                      <label className="custom-amount">
                        <span><Pencil size={15} aria-hidden="true" /> مبلغ آخر</span>
                        <div><input inputMode="numeric" value={customAmount} onChange={(event) => updateCustomAmount(event.target.value)} placeholder="أدخل المبلغ" aria-label="مبلغ مساهمة مخصص" /><strong>ر.س</strong></div>
                      </label>
                    </fieldset>
                  </>
                )}
                {step === 1 && (
                  <>
                    <div className="path-step-heading">
                      <h1>نقترح لك <span>المسار الأنسب</span></h1>
                      <p>اعتمادًا على أهدافك وقيمة مساهمتك وتحليل الفرص بالذكاء الاصطناعي</p>
                    </div>
                    <div className="path-selection">
                      <motion.article className="path-recommendation selected" key={selectedPath.id} aria-label={`المسار المختار ${selectedPath.title}`} initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : .24 }}>
                        <div className="path-recommendation-image"><img src={selectedPath.image} alt={selectedPath.imageAlt} /><span><Home size={12} aria-hidden="true" /> {selectedPath.category}</span></div>
                        <div className="path-recommendation-copy">
                          <span className="recommended-badge"><Sparkles size={12} aria-hidden="true" /> {selectedPath.id === "balanced" ? "الفرصة الموصى بها" : "المسار المختار"}</span>
                          <h2>{selectedPath.title}</h2>
                          <p>{selectedPath.description}</p>
                          <PathImpactMetrics path={selectedPath} />
                          <button ref={detailsButtonRef} className="path-details" type="button" onClick={() => setDetailsOpen(true)}>عرض تفاصيل الفرصة <ArrowLeft size={14} aria-hidden="true" /></button>
                        </div>
                      </motion.article>

                      <h2 className="alternate-paths-title">فرص أخرى مناسبة لك</h2>
                      <div className="alternate-paths">
                        {alternatePaths.map((item) => (
                          <button aria-label={`اختيار ${item.title}`} className={pathId === item.id ? "selected" : ""} type="button" onClick={() => setPathId(item.id)} key={item.id}>
                            <div className="alternate-path-image"><img src={item.image} alt={item.imageAlt} /><span>{item.badge}</span></div>
                            <div className="alternate-path-copy"><h3>{item.title}</h3><p>{item.description}</p><PathImpactMetrics path={item} compact /></div>
                            <span className="path-radio" aria-hidden="true">{pathId === item.id && <Check size={13} />}</span>
                          </button>
                        ))}
                      </div>
                      <div className="local-draft-note"><ShieldCheck size={15} aria-hidden="true" /><span>يتم حفظ اختيارك تلقائيا على هذا الجهاز لتكمل التجربة لاحقا</span></div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="review-step-heading">
                      <span>الخطوة الأخيرة</span>
                      <h1>راجع تفاصيل مساهمتك</h1>
                      <p>تأكد من المسار المختار وقيمة المساهمة ثم اختر وسيلة الدفع المناسبة</p>
                    </div>

                    <article className="review-selected-path">
                      <div className="review-selected-image"><img src={selectedPath.image} alt={selectedPath.imageAlt} /><span><Home size={12} aria-hidden="true" /> {selectedPath.category}</span></div>
                      <div className="review-selected-copy">
                        <span className="review-selected-badge"><CheckCircle2 size={13} aria-hidden="true" /> المسار المختار</span>
                        <h2>{selectedPath.title}</h2>
                        <p>{selectedPath.description}</p>
                        <PathImpactMetrics path={selectedPath} />
                        <button type="button" onClick={() => setStep(1)}><Pencil size={13} aria-hidden="true" /> تعديل المسار</button>
                      </div>
                    </article>

                    <section className="review-contribution" aria-labelledby="review-contribution-title">
                      <div className="review-contribution-heading"><div><span>ملخص المساهمة</span><h2 id="review-contribution-title">تفاصيل المبلغ والأثر</h2></div><button type="button" onClick={() => setStep(0)}><Pencil size={13} aria-hidden="true" /> تعديل المبلغ</button></div>
                      <dl>
                        <div><dt>قيمة المساهمة</dt><dd>{formatSar(amount)}</dd></div>
                        <div><dt>العائد الاجتماعي المتوقع</dt><dd>{selectedPath.returnValue}</dd></div>
                        <div><dt>المستفيدون المتوقعون</dt><dd>{selectedPath.impact}</dd></div>
                        <div><dt>المدة المستهدفة</dt><dd>5 سنوات</dd></div>
                      </dl>
                    </section>

                    <fieldset className="payment-fieldset">
                      <legend>وسيلة الدفع</legend>
                      <div className="payment-options">
                        <button className={paymentMethod === "mada" ? "selected" : ""} type="button" onClick={() => setPaymentMethod("mada")}><CreditCard size={19} /><span><strong>مدى</strong><small>بطاقة بنكية</small></span><i>{paymentMethod === "mada" && <Check size={12} />}</i></button>
                        <button className={paymentMethod === "transfer" ? "selected" : ""} type="button" onClick={() => setPaymentMethod("transfer")}><Landmark size={19} /><span><strong>تحويل بنكي</strong><small>حساب عائد</small></span><i>{paymentMethod === "transfer" && <Check size={12} />}</i></button>
                        <button className={paymentMethod === "wallet" ? "selected" : ""} type="button" onClick={() => setPaymentMethod("wallet")}><WalletCards size={19} /><span><strong>محفظة رقمية</strong><small>دفع سريع</small></span><i>{paymentMethod === "wallet" && <Check size={12} />}</i></button>
                      </div>
                    </fieldset>
                    <label className="disclosure-check">
                      <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
                      <span><Check size={13} /></span>
                      <p>قرأت الإفصاح وأفهم أن الأرقام المعروضة تقديرية وأن العائد المستهدف غير مضمون</p>
                    </label>
                    <div className="review-save-note"><ShieldCheck size={15} aria-hidden="true" /><span>تفاصيل مساهمتك محفوظة محليا على هذا الجهاز</span></div>
                  </>
                )}

                {step === 3 && (
                  <div className="success-state">
                    <div className="success-progress" aria-label="اكتملت رحلة المساهمة">
                      {["قيمة المساهمة", "المسار الاستثماري", "المراجعة", "النتيجة"].map((label, index) => (
                        <div className="complete" key={label}><span>{index < 3 ? <Check size={14} /> : 4}</span><strong>{label}</strong>{index < 3 && <i />}</div>
                      ))}
                    </div>

                    <section className="success-hero" aria-labelledby="success-title">
                      <div className="success-mark"><Check size={38} /></div>
                      <div><span>تم اعتماد مساهمتك بنجاح</span><h1 id="success-title">بدأ أثرك الآن</h1><p>شكرا لك فأنت تصنع أثرا يستمر وينمو</p></div>
                    </section>

                    <section className="success-receipt-card" aria-label="تفاصيل المساهمة">
                      <div className="receipt-primary">
                        <span><WalletCards size={20} /></span><div><small>قيمة المساهمة</small><strong>{formatSar(amount)}</strong></div>
                      </div>
                      <div className="receipt-detail"><span><Home size={19} /></span><div><small>المسار الاستثماري</small><strong>{selectedPath.title}</strong></div></div>
                      <div className="receipt-detail"><span><Clock3 size={19} /></span><div><small>المدة المتوقعة</small><strong>5 سنوات</strong></div></div>
                      <div className="receipt-reference">
                        <div><small>رقم المساهمة</small><strong>#A{(completion?.id ?? "AAID-2453").slice(-5)}</strong></div>
                        <div><small>التاريخ والوقت</small><strong>{formatCompletionTime(completion?.createdAt)}</strong></div>
                        <button type="button" onClick={downloadReceipt}><Download size={16} /> تحميل إيصال المساهمة</button>
                      </div>
                    </section>

                    <section className="impact-now" aria-labelledby="impact-now-title">
                      <div className="success-section-heading"><h2 id="impact-now-title">أثر مساهمتك حتى الآن</h2><p>نتائج أولية مبنية على بيانات المشروع الحالية</p></div>
                      <div className="impact-now-grid">
                        <div><span><Home size={22} /></span><strong>{supportedFamilies}</strong><p>وحدات سكنية قيد التنفيذ</p></div>
                        <div><span><TrendingUp size={22} /></span><strong>{selectedPath.returnValue}</strong><p>عائد اجتماعي متوقع سنويا</p></div>
                        <div><span><Leaf size={22} /></span><strong>{reducedEmissions} طن</strong><p>انخفاض انبعاثات سنويا</p></div>
                        <div><span><Users size={22} /></span><strong>{supportedFamilies}</strong><p>أسر مستفيدة حتى الآن</p></div>
                      </div>
                    </section>

                    <section className="future-projection" aria-labelledby="future-projection-title">
                      <div className="projection-copy">
                        <div className="success-section-heading"><h2 id="future-projection-title">الأثر المستقبلي المتوقع</h2><p>بناء على مدة الاستثمار وإعادة العائد المتوقع</p></div>
                        <div className="projection-chart" aria-label="نمو عدد الأسر المستفيدة خلال سبع سنوات">
                          {projectedFamilies.map((value, index) => {
                            const year = index * 2 + 1;
                            return <div key={index}><strong>{value} {value === 1 ? "أسرة" : "أسر"}</strong><i style={{ height: `${32 + index * 22}%` }} /><small>بعد {year} {year === 1 ? "سنة" : "سنوات"}</small></div>;
                          })}
                        </div>
                      </div>
                      <figure><img src={selectedPath.image} alt={selectedPath.imageAlt} /><figcaption><Home size={16} /> {selectedPath.title}</figcaption></figure>
                    </section>

                    <aside className="success-insight"><span><Lightbulb size={22} /></span><div><strong>رؤية عائد</strong><p>أثرك اليوم يفتح فرصة سكن كريم لأسرة جديدة ويمنح مساهمتك قدرة أكبر على النمو</p></div></aside>

                    <section className="success-continue">
                      <div><span><HandHeart size={24} /></span><div><h2>استمر في صناعة الأثر</h2><p>زيادة مساهماتك تساعدنا على توسيع نطاق الدعم وبناء مستقبل أكثر استدامة</p></div></div>
                      <div><a className="success-again" href="/start">ساهم مرة أخرى <ArrowLeft size={17} /></a><a href="/opportunities">استعرض فرصا أخرى</a></div>
                    </section>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

          </section>

          {step === 0 && (
            <aside className="impact-summary">
              <div className="summary-heading"><span><ActivityGlyph /></span><div><strong>ملخص الأثر المبدئي</strong></div></div>
              <div className="summary-amount"><span>قيمة مساهمتك</span><strong>{formatSar(amount)}</strong></div>
              <div className="summary-metrics">
                <div><span><TrendingUp size={16} /></span><small>العائد السنوي المستهدف</small><strong>{formatSar(annualReturn)}</strong></div>
                <div><span><CircleDollarSign size={16} /></span><small>المعاد استثماره</small><strong>{formatSar(reinvested)}</strong></div>
                <div><span><Users size={16} /></span><small>الأثر خلال 5 سنوات</small><strong>{families.toFixed(2)} أسرة</strong></div>
              </div>
              <div className="summary-path"><Building2 size={17} /><div><small>الفرصة المختارة</small><strong>{opportunity.title}</strong></div></div>
              <div className="summary-assurance"><Info size={17} /><p>محاكاة تقديرية وليست عائدًا مضمونًا</p></div>
            </aside>
          )}

          {step < 3 && (
            <>
              <div className="start-stage-rail" aria-label="مراحل المساهمة">
                {steps.map((label, index) => <div className={index === step ? "active" : index < step ? "complete" : ""} key={label}><span>{index < step ? <Check size={13} /> : index + 1}</span><strong>{label}</strong></div>)}
              </div>
              <div className="start-navigation">
                <button className="start-primary-action" type="button" onClick={goNext} disabled={!canContinue}>{step === 2 ? "تأكيد المساهمة" : step === 1 ? "اعتماد هذا المسار" : "التالي"}<ArrowLeft size={17} /></button>
                {step > 0 ? <button className="start-secondary-action" type="button" onClick={goBack}><ArrowRight size={16} /> السابق</button> : <a className="start-secondary-action" href="/opportunities">العودة للفرص</a>}
              </div>
            </>
          )}
        </div>
      </main>
      <AnimatePresence>
        {detailsOpen && <PathDetailsModal path={selectedPath} amount={amount} onClose={closeDetails} reduceMotion={Boolean(reduceMotion)} />}
      </AnimatePresence>
      <footer className="start-footer"><span>© 2026 عائد نموذج واجهة تجريبي</span><div><a href="#privacy">الخصوصية</a><a href="#terms">الشروط</a><a href="#support">المساعدة</a></div></footer>
    </div>
  );
}

function ActivityGlyph() {
  return <span className="activity-glyph" aria-hidden="true"><i /><i /><i /></span>;
}

function formatCompletionTime(value?: string) {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date).replace(/[،,]/g, "");
}

function PathImpactMetrics({ path, compact = false }: { path: (typeof paths)[number]; compact?: boolean }) {
  return (
    <div className={`path-impact-metrics ${compact ? "is-compact" : ""}`}>
      <span><ShieldCheck size={17} aria-hidden="true" /><small>مستوى الاستدامة</small><strong>{path.risk}</strong></span>
      <span><TrendingUp size={17} aria-hidden="true" /><small>عائد اجتماعي متوقع</small><strong>{path.returnValue}</strong></span>
      <span><Users size={17} aria-hidden="true" /><small>مستفيد متوقع</small><strong>{path.impact.replace(" مستفيد", "")}</strong></span>
    </div>
  );
}

function PathDetailsModal({ path, amount, onClose, reduceMotion }: { path: (typeof paths)[number]; amount: number; onClose: () => void; reduceMotion: boolean }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
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

  const allocation = path.id === "balanced" ? [65, 25, 10] : path.id === "impact" ? [55, 35, 10] : [70, 20, 10];

  return (
    <motion.div className="path-modal-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .2 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <motion.div ref={dialogRef} className="path-modal" role="dialog" aria-modal="true" aria-labelledby="path-modal-title" initial={{ opacity: 0, y: reduceMotion ? 0 : 24, scale: reduceMotion ? 1 : .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduceMotion ? 0 : 16, scale: reduceMotion ? 1 : .99 }} transition={{ duration: reduceMotion ? 0 : .25 }}>
        <button ref={closeRef} className="path-modal-close" type="button" onClick={onClose} aria-label="إغلاق تفاصيل الفرصة"><X size={19} aria-hidden="true" /></button>
        <div className="path-modal-hero">
          <div className="path-modal-image"><img src={path.image} alt={path.imageAlt} /><span>{path.category}</span></div>
          <div className="path-modal-title">
            <span><BadgeCheck size={15} aria-hidden="true" /> فرصة أثر موثوقة</span>
            <h2 id="path-modal-title">{path.title}</h2>
            <p>{path.description}</p>
            <div><span><MapPin size={14} aria-hidden="true" /> مدينة الرياض</span><span><CalendarDays size={14} aria-hidden="true" /> مدة مستهدفة 5 سنوات</span></div>
          </div>
        </div>

        <div className="path-modal-kpis">
          <div><small>المساهمة الحالية</small><strong>{formatSar(amount)}</strong></div>
          <div><small>العائد الاجتماعي المتوقع</small><strong>{path.returnValue}</strong></div>
          <div><small>المستفيدون المتوقعون</small><strong>{path.impact}</strong></div>
          <div><small>مستوى الاستدامة</small><strong>{path.risk}</strong></div>
        </div>

        <div className="path-modal-content">
          <section aria-labelledby="allocation-title">
            <span>هيكلة المساهمة</span>
            <h3 id="allocation-title">كيف تعمل مساهمتك</h3>
            <div className="allocation-lines">
              <div><span>تطوير وتمويل الوحدات <strong>{allocation[0]}%</strong></span><i><b style={{ width: `${allocation[0]}%` }} /></i></div>
              <div><span>تشغيل وقياس الأثر <strong>{allocation[1]}%</strong></span><i><b style={{ width: `${allocation[1]}%` }} /></i></div>
              <div><span>احتياطي الاستدامة <strong>{allocation[2]}%</strong></span><i><b style={{ width: `${allocation[2]}%` }} /></i></div>
            </div>
          </section>
          <section aria-labelledby="governance-title">
            <span>الحوكمة والمتابعة</span>
            <h3 id="governance-title">وضوح في كل مرحلة</h3>
            <div className="governance-list">
              <div><Check size={14} aria-hidden="true" /><span><strong>تحقق أهلية المستفيدين</strong><small>مراجعة معايير الاستحقاق قبل التخصيص</small></span></div>
              <div><Check size={14} aria-hidden="true" /><span><strong>اعتماد التخصيص</strong><small>توثيق مسار الأموال وربطه بالوحدات</small></span></div>
              <div><Check size={14} aria-hidden="true" /><span><strong>تقارير أثر دورية</strong><small>تحديثات واضحة داخل محفظة المستخدم</small></span></div>
            </div>
          </section>
        </div>

        <div className="path-modal-footer"><div><ShieldCheck size={17} aria-hidden="true" /><span><strong>إفصاح النموذج الأولي</strong><small>المؤشرات تقديرية لعرض تجربة المنتج ولا تمثل ضمانا للعائد</small></span></div><button type="button" onClick={onClose}>العودة إلى المسار</button></div>
      </motion.div>
    </motion.div>
  );
}
