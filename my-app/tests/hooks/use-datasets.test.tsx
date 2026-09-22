import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeDataset } from "@/tests/fixtures/factories";
import { useDatasetDelete, useDatasetUpload } from "@/hooks/use-datasets";

const mocks = vi.hoisted(() => ({
  deleteDataset: vi.fn(),
  getToken: vi.fn(),
  uploadDataset: vi.fn(),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ getToken: mocks.getToken }),
}));

vi.mock("@/lib/api/datasets", () => ({
  deleteDataset: mocks.deleteDataset,
  uploadDataset: mocks.uploadDataset,
}));

describe("dataset hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getToken.mockResolvedValue("test-token");
  });

  it("uploads a file and exposes the processed dataset", async () => {
    const dataset = makeDataset();
    const file = new File(["customerID\nCUST-001"], "customers.csv", {
      type: "text/csv",
    });
    mocks.uploadDataset.mockResolvedValue(dataset);
    const { result } = renderHook(() => useDatasetUpload());

    await act(async () => {
      await expect(result.current.uploadFile(file)).resolves.toEqual(dataset);
    });

    expect(mocks.getToken).toHaveBeenCalledWith({ template: "signalretention" });
    expect(mocks.uploadDataset).toHaveBeenCalledWith("test-token", file);
    expect(result.current.status).toBe("processed");
    expect(result.current.dataset).toEqual(dataset);
    expect(result.current.error).toBeNull();
  });

  it("reports an authentication failure and can reset upload state", async () => {
    mocks.getToken.mockResolvedValue(null);
    const { result } = renderHook(() => useDatasetUpload());

    await act(async () => {
      await expect(
        result.current.uploadFile(new File(["data"], "customers.csv")),
      ).rejects.toThrow("Unable to authenticate upload request");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("Unable to authenticate upload request");

    act(() => result.current.reset());
    expect(result.current.status).toBe("idle");
    expect(result.current.error).toBeNull();
  });

  it("deletes a dataset and clears its pending state", async () => {
    let finishDelete: (() => void) | undefined;
    mocks.deleteDataset.mockImplementation(
      () => new Promise<void>((resolve) => (finishDelete = resolve)),
    );
    const { result } = renderHook(() => useDatasetDelete());

    let deletion: Promise<boolean>;
    act(() => {
      deletion = result.current.removeDataset("dataset-1");
    });
    await waitFor(() => expect(result.current.deletingDatasetId).toBe("dataset-1"));

    await act(async () => {
      finishDelete?.();
      await expect(deletion!).resolves.toBe(true);
    });

    expect(mocks.deleteDataset).toHaveBeenCalledWith("test-token", "dataset-1");
    expect(result.current.deletingDatasetId).toBeNull();
    expect(result.current.deleteError).toBeNull();
  });

  it("returns false and exposes safe deletion errors", async () => {
    mocks.deleteDataset.mockRejectedValue(new Error("Dataset not found"));
    const { result } = renderHook(() => useDatasetDelete());

    await act(async () => {
      await expect(result.current.removeDataset("missing")).resolves.toBe(false);
    });

    expect(result.current.deleteError).toBe("Dataset not found");
    expect(result.current.deletingDatasetId).toBeNull();
  });
});
