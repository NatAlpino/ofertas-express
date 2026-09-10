import { describe, expect, it } from "vitest";
import { formatBRL } from "@/utils/format";

describe("formatBRL", () => {
  it("formats cents as BRL currency", () => {
    expect(formatBRL(98000)).toBe("R$ 980,00");
    expect(formatBRL(245000)).toBe("R$ 2.450,00");
    expect(formatBRL(155000)).toBe("R$ 1.550,00");
  });

  it("formats zero", () => {
    expect(formatBRL(0)).toBe("R$ 0,00");
  });
});
