"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle, FileText, Sparkles, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import type { DatasetRead } from "@/types/api";

type UploadStatus = "idle" | "uploading" | "processed" | "error";

type DataSetsUploaderProps = {
  error: string | null;
  status: UploadStatus;
  onUploadFile: (file: File) => Promise<DatasetRead>;
  onUploadComplete?: (dataset: DatasetRead) => void;
};

export function DataSetsUploader({
  error,
  status,
  onUploadFile,
  onUploadComplete,
}: DataSetsUploaderProps) {
  const [fileName, setFileName] = useState("");
  const [demoError, setDemoError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const attachmentState =
    status === "uploading"
      ? "processing"
      : status === "processed"
        ? "done"
        : status === "error"
          ? "error"
          : "idle";

  const attachmentDescription =
    status === "uploading"
      ? "Processing dataset with AI"
      : status === "processed"
        ? "Dataset processed successfully"
        : status === "error"
          ? (error ?? "Upload failed. Please try again.")
          : "CSV file";

  async function uploadFile(file: File) {
    setFileName(file.name);
    setDemoError(null);

    try {
      const dataset = await onUploadFile(file);
      onUploadComplete?.(dataset);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
    event.target.value = "";
  }

  async function handleDemoDataset() {
    try {
      setDemoError(null);
      const response = await fetch("/demo/signal-retention-demo.csv");
      if (!response.ok) throw new Error("Unable to load the demo dataset");

      const file = new File(
        [await response.blob()],
        "signal-retention-demo.csv",
        { type: "text/csv" },
      );
      await uploadFile(file);
    } catch (error) {
      console.error("Error loading demo dataset:", error);
      setDemoError("The demo dataset could not be loaded. Please try again.");
    }
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  return (
    <Card className="border-[#E7DED1] bg-white shadow-none dark:border-[#3A312A] dark:bg-[#1F1A16]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Add Your Dataset</CardTitle>

        <p className="text-muted-foreground">
          Upload CSV files containing customer activity, revenue, and churn data.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="flex flex-col gap-4 rounded-lg border border-[#D8CFC4] bg-[#F8F4EE] p-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#3A312A] dark:bg-muted/40">
          <div>
            <p className="font-semibold">Try SignalRetention with demo data</p>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              This demo currently supports the Telco Customer Churn CSV schema.
              Support for additional dataset formats is planned for a future release.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            disabled={status === "uploading"}
            onClick={() => void handleDemoDataset()}
          >
            <Sparkles className="size-4" />
            Use Demo Dataset
          </Button>
        </div>

        {demoError && (
          <p role="alert" className="text-sm text-red-700">
            {demoError}
          </p>
        )}

        {status === "idle" ? (
          <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D8CFC4] bg-[#FCFAF7] p-8 text-center transition hover:bg-[#F8F4EE] dark:border-[#3A312A] dark:bg-muted/30 dark:hover:bg-muted/50">
            <>
              <Upload className="mb-4 h-10 w-10 text-muted-foreground" />

              <p className="text-lg font-medium">
                Drag & drop or choose file to upload
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                CSV files only - Max 10MB
              </p>

              <Button
                type="button"
                onClick={openFilePicker}
                className="mt-6 bg-[#5A3B26] hover:bg-[#4A2F1E]"
              >
                Choose File
              </Button>
            </>
          </label>
        ) : (
          <div className="rounded-xl border border-[#E7DED1] bg-[#FCFAF7] p-4 dark:border-[#3A312A] dark:bg-muted/30">
            <Attachment
              state={attachmentState}
              className="w-full rounded-xl border-[#E7DED1] bg-white dark:border-[#3A312A] dark:bg-[#1F1A16]"
            >
              <AttachmentMedia className="bg-[#F1ECE4] text-[#5A3B26] dark:bg-muted">
                {status === "processed" ? (
                  <CheckCircle className="h-5 w-5 text-green-700" />
                ) : status === "error" ? (
                  <AlertCircle className="h-5 w-5 text-red-700" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </AttachmentMedia>

              <AttachmentContent>
                <AttachmentTitle>{fileName}</AttachmentTitle>
                <AttachmentDescription>
                  {attachmentDescription}
                </AttachmentDescription>
              </AttachmentContent>

              <AttachmentActions>
                {status !== "uploading" && (
                  <AttachmentAction
                    type="button"
                    aria-label="Choose another CSV file"
                    onClick={openFilePicker}
                  >
                    <Upload className="h-4 w-4" />
                  </AttachmentAction>
                )}
              </AttachmentActions>
            </Attachment>

            {status === "uploading" && (
              <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-[#E7DED1]">
                <div className="absolute h-full w-1/3 animate-[upload-slide_1.4s_ease-in-out_infinite] rounded-full bg-[#5A3B26]" />
              </div>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </CardContent>
    </Card>
  );
}

