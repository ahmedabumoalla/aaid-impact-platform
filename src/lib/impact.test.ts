import { describe, expect, it } from "vitest";
import { calculateImpact } from "./impact";

describe("calculateImpact", () => {
  it("matches the one-million-riyal reference scenario", () => {
    expect(calculateImpact(1_000_000)).toEqual({
      annualReturn: 150_000,
      reinvestedFirstYear: 45_000,
      fiveYearAssetValue: 1_250_000,
      familiesReached: 57,
    });
  });

  it("does not return negative impact", () => {
    expect(calculateImpact(-100).annualReturn).toBe(0);
  });
});
