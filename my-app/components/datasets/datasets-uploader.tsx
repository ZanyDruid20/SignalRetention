"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UploadStatus = "idle" | "processing" | "processed";

export function DataSetsUploader() {
    const [fileName, setFileName] = useState("");
    const [status, setStatus] = useState<UploadStatus>("idle");

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        setStatus("processing");

        setTimeout(() => {
            setStatus("processed");
        }, 1500);
    }
    return (
        <Card className="border-[#E7DED1] bg-white">
        <CardHeader>
            <CardTitle className="text-2xl font-bold">
            Add Your Dataset
            </CardTitle>

            <p className="text-muted-foreground">
            Upload CSV files containing customer activity, revenue, and churn data.
            </p>
        </CardHeader>
        <CardContent>
        <label className="flex min-h-65 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D8CFC4] bg-[#FCFAF7] p-8 text-center transition hover:bg-[#F8F4EE]">
          {status === "idle" && (
            <>
              <Upload className="mb-4 h-10 w-10 text-muted-foreground" />

              <p className="text-lg font-medium">
                Drag & drop or choose file to upload
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                CSV files only · Max 5MB
              </p>

              <Button
                type="button"
                className="mt-6 bg-[#5A3B26] hover:bg-[#4A2F1E]"
              >
                Choose File
              </Button>
            </>
          )}
                    {status === "processing" && (
            <>
              <FileText className="mb-4 h-10 w-10 text-[#5A3B26]" />

              <p className="text-lg font-medium">
                Processing dataset...
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {fileName}
              </p>
            </>
          )}

          {status === "processed" && (
            <>
              <CheckCircle className="mb-4 h-10 w-10 text-green-700" />

              <p className="text-lg font-medium">
                Dataset processed successfully
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {fileName}
              </p>
            </>
          )}

          <input
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