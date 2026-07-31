"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle, FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      const dataset = await onUploadFile(file);
      onUploadComplete?.(dataset);
    } finally {
      event.target.value = "";
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

      <CardContent>
        <label className="flex min-h-65 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D8CFC4] bg-[#FCFAF7] p-8 text-center transition hover:bg-[#F8F4EE] dark:border-[#3A312A] dark:bg-muted/30 dark:hover:bg-muted/50">
          {status === "idle" && (
            <>
              <Upload className="mb-4 h-10 w-10 text-muted-foreground" />

              <p className="text-lg font-medium">
                Drag & drop or choose file to upload
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                CSV files only · Max 10MB
              </p>

              <Button
                type="button"
                onClick={openFilePicker}
                className="mt-6 bg-[#5A3B26] hover:bg-[#4A2F1E]"
              >
                Choose File
              </Button>
            </>
          )}

          {status === "uploading" && (
            <>
              <FileText className="mb-4 h-10 w-10 text-[#5A3B26]" />

              <p className="text-lg font-medium">
                Uploading and processing dataset...
              </p>

              <p className="mt-2 text-sm text-muted-foreground">{fileName}</p>

              <div className="mt-6 h-2 w-full max-w-sm overflow-hidden rounded-full bg-[#E7DED1]">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-[#5A3B26]" />
              </div>
            </>
          )}

          {status === "processed" && (
            <>
              <CheckCircle className="mb-4 h-10 w-10 text-green-700" />

              <p className="text-lg font-medium">
                Dataset processed successfully
              </p>

              <p className="mt-2 text-sm text-muted-foreground">{fileName}</p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="mb-4 h-10 w-10 text-red-700" />

              <p className="text-lg font-medium">Dataset upload failed</p>

              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                {error ?? "Please check the file and try again."}
              </p>

              <Button
                type="button"
                onClick={openFilePicker}
                className="mt-6 bg-[#5A3B26] hover:bg-[#4A2F1E]"
              >
                Choose Another File
              </Button>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </CardContent>
    </Card>
  );
}
