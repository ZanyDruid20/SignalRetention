import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DatasetTable } from "@/components/datasets/datasets-table";
import { makeDataset } from "@/tests/fixtures/factories";

const baseProps = {
  deletingDatasetId: null,
  deleteError: null,
  onDeleteDataset: vi.fn(),
};

describe("DatasetTable", () => {
  it("renders loading, error, and empty states", () => {
    const { rerender } = render(<DatasetTable {...baseProps} isLoading />);
    expect(screen.getByText("Loading datasets...")).toBeInTheDocument();

    rerender(<DatasetTable {...baseProps} error="Unable to load datasets" />);
    expect(screen.getByText("Unable to load datasets")).toBeInTheDocument();

    rerender(<DatasetTable {...baseProps} />);
    expect(screen.getByText("No datasets uploaded yet.")).toBeInTheDocument();
  });

  it("maps backend status and record count for display", () => {
    render(
      <DatasetTable
        {...baseProps}
        uploadedDatasets={[
          makeDataset({
            filename: "churn.csv",
            record_count: 7043,
            upload_status: "completed",
          }),
        ]}
      />,
    );

    expect(screen.getByText("churn.csv")).toBeInTheDocument();
    expect(screen.getByText("7,043")).toBeInTheDocument();
    expect(screen.getByText("Processed")).toBeInTheDocument();
  });

  it("requires confirmation before deleting and closes after success", async () => {
    const user = userEvent.setup();
    const dataset = makeDataset({ id: "dataset-delete", filename: "delete.csv" });
    const onDeleteDataset = vi.fn().mockResolvedValue(true);
    render(
      <DatasetTable
        {...baseProps}
        uploadedDatasets={[dataset]}
        onDeleteDataset={onDeleteDataset}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete delete.csv" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/This permanently deletes delete.csv/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete dataset" }));
    expect(onDeleteDataset).toHaveBeenCalledWith("dataset-delete");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the confirmation open and shows deletion errors", async () => {
    const user = userEvent.setup();
    render(
      <DatasetTable
        {...baseProps}
        uploadedDatasets={[makeDataset({ filename: "protected.csv" })]}
        deleteError="You do not own this dataset"
        onDeleteDataset={vi.fn().mockResolvedValue(false)}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Delete protected.csv" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "You do not own this dataset",
    );
    await user.click(screen.getByRole("button", { name: "Delete dataset" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
