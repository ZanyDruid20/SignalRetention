import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DatasetsPage from "@/app/datasets/page";
import { makeDataset } from "@/tests/fixtures/factories";

const mocks = vi.hoisted(() => ({ getToken: vi.fn(), listDatasets: vi.fn(), removeDataset: vi.fn(), uploadFile: vi.fn() }));
vi.mock("@clerk/nextjs", () => ({ useAuth: () => ({ getToken: mocks.getToken }) }));
vi.mock("@/lib/api/datasets", () => ({ listDatasets: mocks.listDatasets }));
vi.mock("@/hooks/use-datasets", () => ({
  useDatasetUpload: () => ({ error: null, status: "idle", uploadFile: mocks.uploadFile }),
  useDatasetDelete: () => ({ deletingDatasetId: null, deleteError: null, removeDataset: mocks.removeDataset }),
}));
vi.mock("@/components/datasets/datasets-header", () => ({ DatasetsHeader: () => <div>Datasets header</div> }));
vi.mock("@/components/datasets/datasets-stats", () => ({ DatasetsStats: ({ totalDatasets, activeDatasets, pendingDatasets }: { totalDatasets: number; activeDatasets: number; pendingDatasets: number }) => <div>Stats {totalDatasets}/{activeDatasets}/{pendingDatasets}</div> }));
vi.mock("@/components/datasets/datasets-uploader", () => ({ DataSetsUploader: ({ onUploadComplete }: { onUploadComplete: (dataset: ReturnType<typeof makeDataset>) => void }) => <button onClick={() => onUploadComplete(makeDataset({ id: "uploaded", filename: "uploaded.csv" }))}>Complete upload</button> }));
vi.mock("@/components/datasets/datasets-table", () => ({ DatasetTable: ({ uploadedDatasets, onDeleteDataset, error }: { uploadedDatasets: Array<{ id: string; filename: string }>; onDeleteDataset: (id: string) => Promise<boolean>; error: string | null }) => <div>{error ?? uploadedDatasets.map((d) => <span key={d.id}>{d.filename}</span>)}<button onClick={() => void onDeleteDataset(uploadedDatasets[0]?.id)}>Delete first</button></div> }));

describe("DatasetsPage", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.getToken.mockResolvedValue("token"); mocks.removeDataset.mockResolvedValue(true); });

  it("loads, prepends uploads, and removes deleted datasets", async () => {
    mocks.listDatasets.mockResolvedValue([makeDataset({ id: "existing", filename: "existing.csv" })]);
    render(<DatasetsPage />);
    expect(await screen.findByText("existing.csv")).toBeInTheDocument();
    expect(screen.getByText("Stats 1/1/0")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Complete upload" }));
    expect(screen.getByText("uploaded.csv")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Delete first" }));
    await waitFor(() => expect(screen.queryByText("uploaded.csv")).not.toBeInTheDocument());
  });

  it("shows a safe list error when authentication fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.getToken.mockResolvedValue(null);
    render(<DatasetsPage />);
    expect(await screen.findByText("Failed to load datasets. Please try again later.")).toBeInTheDocument();
  });
});
