import { describe, expect, it } from "vitest";

describe("msw mock server", () => {
  it("serves the offers fixture over a mocked request", async () => {
    const response = await fetch("/api/offers");
    expect(response.ok).toBe(true);

    const data = await response.json();
    expect(data).toHaveLength(3);
    expect(data[0]).toMatchObject({
      id: "oferta-1",
      title: "Negocie agora",
    });
  });
});
