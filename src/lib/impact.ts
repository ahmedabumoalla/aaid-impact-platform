export type ImpactProjection = {
  annualReturn: number;
  reinvestedFirstYear: number;
  fiveYearAssetValue: number;
  familiesReached: number;
};

export function calculateImpact(amount: number): ImpactProjection {
  const safeAmount = Math.max(0, amount);

  return {
    annualReturn: safeAmount * 0.15,
    reinvestedFirstYear: safeAmount * 0.045,
    fiveYearAssetValue: safeAmount * 1.25,
    familiesReached: Math.round((safeAmount / 1_000_000) * 57),
  };
}

export function formatSar(value: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
}
