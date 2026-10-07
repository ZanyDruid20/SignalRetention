import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataSetsUploader } from "@/components/datasets/datasets-uploader";
import { makeDataset } from "@/tests/fixtures/factories";

describe("DataSetsUploader", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uploads the selected CSV and reports completion", async () => {
    const user = userEvent.setup();
    const dataset = makeDataset();
    const onUploadFile = vi.fn().mockResolvedValue(dataset);
    const onUploadComplete = vi.fn();
    const { container } = render(
      <DataSetsUploader
        error={null}
        status="idle"
        onUploadFile={onUploadFile}
        onUploadComplete={onUploadComplete}
      />,
    );
    const file = new File(["customerID\nCUST-001"], "customers.csv", {
      type: "text/csv",
    });

    await user.upload(container.querySelector("input[type=file]")!, file);

    expect(onUploadFile).toHaveBeenCalledWith(file);
    expect(onUploadComplete).toHaveBeenCalledWith(dataset);
  });

  it("shows progress, success, and safe failure messages", () => {
    const props = { onUploadFile: vi.fn() };
    const { rerender } = render(
      <DataSetsUploader {...props} error={null} status="uploading" />,
    );
    expect(screen.getByText("Processing dataset with AI")).toBeInTheDocument();

    rerender(<DataSetsUploader {...props} error={null} status="processed" />);
    expect(screen.getByText("Dataset processed successfully")).toBeInTheDocument();

    rerender(
      <DataSetsUploader
        {...props}
        error="Only CSV files are supported"
        status="error"
      />,
    );
    expect(screen.getByText("Only CSV files are supported")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Choose another CSV file" }),
    ).toBeEnabled();
  });

  it("uploads the bundled demo dataset", async () => {
    const user = userEvent.setup();
    const dataset = makeDataset({ filename: "signal-retention-demo.csv" });
    const onUploadFile = vi.fn().mockResolvedValue(dataset);
    const onUploadComplete = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["customerID\nCUST-001"], { type: "text/csv" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <DataSetsUploader
        error={null}
        status="idle"
        onUploadFile={onUploadFile}
        onUploadComplete={onUploadComplete}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Use Demo Dataset" }));

    expect(fetchMock).toHaveBeenCalledWith("/demo/signal-retention-demo.csv");
    expect(onUploadFile).toHaveBeenCalledWith(
      expect.objectContaining({ name: "signal-retention-demo.csv" }),
    );
    expect(onUploadComplete).toHaveBeenCalledWith(dataset);
  });
});
