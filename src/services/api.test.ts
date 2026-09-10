import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { apiFetch, ApiError } from "@/services/api";

describe("apiFetch", () => {
  it("returns parsed json on success", async () => {
    const data = await apiFetch<Array<{ id: string }>>("/api/offers");
    expect(data).toHaveLength(3);
  });

  it("throws ApiError on non-OK responses", async () => {
    server.use(
      http.get("/api/offers", () =>
        HttpResponse.json({ message: "boom" }, { status: 500 }),
      ),
    );

    const error = (await apiFetch("/api/offers").catch(
      (err) => err,
    )) as ApiError;
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("boom");
    expect(error.status).toBe(500);
  });
});
