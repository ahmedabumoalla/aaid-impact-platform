export type ContributionOpportunity = {
  id: string;
  title: string;
  subtitle: string;
  district: string;
  status: "متاح" | "قيد التمويل";
  funded: number;
  target: string;
  image: string;
  imageAlt: string;
};

export const contributionOpportunities: ContributionOpportunity[] = [
  {
    id: "riyadh-central",
    title: "أصل سكني — الرياض",
    subtitle: "فلل سكنية راقية",
    district: "وسط الرياض",
    status: "متاح",
    funded: 70,
    target: "1.5 مليون",
    image: "/assets/aaid-riyadh-central-residence.png",
    imageAlt: "فلل سكنية حديثة في وسط مدينة الرياض",
  },
  {
    id: "riyadh-north",
    title: "أصل سكني — شمال الرياض",
    subtitle: "شقق سكنية",
    district: "شمال الرياض",
    status: "متاح",
    funded: 30,
    target: "2.0 مليون",
    image: "/assets/aaid-riyadh-north-villas.png",
    imageAlt: "مجمع سكني حديث في شمال مدينة الرياض",
  },
  {
    id: "riyadh-east",
    title: "محفظة أثر — شرق الرياض",
    subtitle: "مجتمع سكني حديث",
    district: "شرق الرياض",
    status: "قيد التمويل",
    funded: 60,
    target: "3.0 مليون",
    image: "/assets/aaid-riyadh-east-apartments.png",
    imageAlt: "مبنى شقق سكنية في شرق مدينة الرياض",
  },
  {
    id: "riyadh-rent-support",
    title: "برنامج دعم الإيجار",
    subtitle: "دعم الأسر المستحقة",
    district: "مدينة الرياض",
    status: "قيد التمويل",
    funded: 45,
    target: "1.2 مليون",
    image: "/assets/aaid-riyadh-south-courtyard.png",
    imageAlt: "مجتمع سكني للأسر المستحقة في مدينة الرياض",
  },
];
