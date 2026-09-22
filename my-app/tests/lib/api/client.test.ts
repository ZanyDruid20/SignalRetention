import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiUpload,
} from "@/lib/api/client";

const fetchMock = vi.fn<typeof fetch>();

function response(body: unknown, init: ResponseInit = {}) {
  return new Response(
    body === undefined ? undefined : JSON.stringify(body),
    { status: 200, ...init, headers: { "Content-Type": "application/json", ...init.headers } },
  );
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("API client", () => {
  it("sends authenticated GET requests and parses JSON", async () => {
    fetchMock.mockResolvedValue(response({ value: 42 }));

    await expect(apiGet<{ value: number }>("/health", "token-123")).resolves.toEqual({ value: 42 });
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/health", {
      method: "GET",
      headers: { Authorization: "Bearer token-123" },
    });
  });

  it("rejects unsuccessful GET responses without exposing a body", async () => {
    fetchMock.mockResolvedValue(response({ detail: "private" }, { status: 403 }));

    await expect(apiGet("/private", "token")).rejects.toThrow(
      "API request failed with status 403",
    );
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(apiGet("/datasets", "token")).rejects.toThrow("Failed to fetch");
  });

  it("rejects malformed successful JSON", async () => {
    fetchMock.mockResolvedValue(new Response("not-json", { status: 200 }));

    await expect(apiGet("/datasets", "token")).rejects.toBeInstanceOf(SyntaxError);
  });

  it("uploads FormData without overriding its content type", async () => {
    fetchMock.mockResolvedValue(response({ id: "dataset-1" }, { status: 201 }));
    const formData = new FormData();
    formData.append("file", new File(["a,b"], "customers.csv"));

    await apiUpload("/datasets/upload", "token", formData);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/datasets/upload",
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: "Bearer token" },
        body: formData,
      }),
    );
  });

  it("uses backend upload error text when available", async () => {
    fetchMock.mockResolvedValue(new Response("Missing required columns", { status: 400 }));

    await expect(apiUpload("/datasets/upload", "token", new FormData())).rejects.toThrow(
      "Missing required columns",
    );
  });

  it("sends JSON PATCH requests", async () => {
    fetchMock.mockResolvedValue(response({ status: "completed" }));

    await apiPatch("/recommendations/1/status", "token", { status: "completed" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/recommendations/1/status",
      expect.objectContaining({
        method: "PATCH",
        headers: {
          Authorization: "Bearer token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "completed" }),
      }),
    );
  });

  it("sends JSON POST requests", async () => {
    fetchMock.mockResolvedValue(response({ id: "simulation-1" }, { status: 201 }));

    await apiPost("/simulations", "token", { intensity_percentage: 50 });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/simulations",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ intensity_percentage: 50 }) }),
    );
  });

  it("accepts successful empty DELETE responses", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiDelete("/datasets/1", "token")).resolves.toBeUndefined();
  });

  it("uses backend DELETE error text and falls back to status", async () => {
    fetchMock.mockResolvedValueOnce(new Response("Dataset not found", { status: 404 }));
    await expect(apiDelete("/datasets/1", "token")).rejects.toThrow("Dataset not found");

    fetchMock.mockResolvedValueOnce(new Response("", { status: 500 }));
    await expect(apiDelete("/datasets/1", "token")).rejects.toThrow(
      "Delete request failed with status 500",
    );
  });
});
