export type ContributionOpportunity = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  district: string;
  status: "متاح" | "قيد التمويل";
  funded: number;
  target: string;
  expectedReturn: string;
  beneficiaries: number;
  sustainability: "مرتفع" | "متوسط";
  duration: string;
  allocation: readonly [number, number, number];
  image: string;
  imageAlt: string;
};

export const contributionOpportunities: ContributionOpportunity[] = [
  {
    id: "riyadh-central",
    title: "أصل سكني — الرياض",
    subtitle: "فلل سكنية راقية",
    category: "سكني",
    description: "تطوير وحدات سكنية نوعية في وسط الرياض ضمن مراحل تمويل وتنفيذ واضحة وقابلة للمتابعة",
    district: "وسط الرياض",
    status: "متاح",
    funded: 70,
    target: "1.5 مليون",
    expectedReturn: "6٪",
    beneficiaries: 120,
    sustainability: "مرتفع",
    duration: "5 سنوات",
    allocation: [65, 25, 10],
    image: "/assets/aaid-riyadh-central-residence.webp",
    imageAlt: "فلل سكنية حديثة في وسط مدينة الرياض",
  },
  {
    id: "riyadh-north",
    title: "أصل سكني — شمال الرياض",
    subtitle: "شقق سكنية",
    category: "سكني",
    description: "توفير شقق سكنية حديثة في شمال الرياض لدعم التوسع العمراني ورفع جودة الاستقرار السكني",
    district: "شمال الرياض",
    status: "متاح",
    funded: 30,
    target: "2.0 مليون",
    expectedReturn: "5٪",
    beneficiaries: 300,
    sustainability: "متوسط",
    duration: "4 سنوات",
    allocation: [55, 35, 10],
    image: "/assets/aaid-riyadh-north-villas.webp",
    imageAlt: "مجمع سكني حديث في شمال مدينة الرياض",
  },
  {
    id: "riyadh-east",
    title: "محفظة أثر — شرق الرياض",
    subtitle: "مجتمع سكني حديث",
    category: "صندوق أثر",
    description: "محفظة سكنية متعددة الأصول تدعم إنشاء مجتمع حديث وتوسيع نطاق الأثر في شرق الرياض",
    district: "شرق الرياض",
    status: "قيد التمويل",
    funded: 60,
    target: "3.0 مليون",
    expectedReturn: "4٪",
    beneficiaries: 500,
    sustainability: "مرتفع",
    duration: "5 سنوات",
    allocation: [70, 20, 10],
    image: "/assets/aaid-riyadh-east-apartments.webp",
    imageAlt: "مبنى شقق سكنية في شرق مدينة الرياض",
  },
  {
    id: "riyadh-rent-support",
    title: "برنامج دعم الإيجار",
    subtitle: "دعم الأسر المستحقة",
    category: "دعم سكني",
    description: "دعم مباشر يساعد الأسر المستحقة على استقرارها السكني مع متابعة أثر المساهمة ونتائجها",
    district: "مدينة الرياض",
    status: "قيد التمويل",
    funded: 45,
    target: "1.2 مليون",
    expectedReturn: "4٪",
    beneficiaries: 250,
    sustainability: "مرتفع",
    duration: "3 سنوات",
    allocation: [60, 30, 10],
    image: "/assets/aaid-riyadh-south-courtyard.webp",
    imageAlt: "مجتمع سكني للأسر المستحقة في مدينة الرياض",
  },
];
