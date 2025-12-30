"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonacoEditor } from "./MonacoEditor";
import { cn, formatBytes, formatDuration, getStatusClass } from "@/lib/utils";
import type { ResponseData } from "@/types";
import { Loader2, AlertCircle } from "lucide-react";
import { useRequestStore } from "@/store/requestStore";

interface ResponseViewerProps {
  response: ResponseData | null;
  isLoading: boolean;
}

export function ResponseViewer({ response, isLoading }: ResponseViewerProps) {
  const { error } = useRequestStore();

  // Create a safe HTML preview using iframe srcdoc
  const htmlPreviewSrc = useMemo(() => {
    if (!response?.body) return "";
    // Wrap the HTML in a basic document structure for proper rendering
    return response.body;
  }, [response?.body]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Sending request...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-destructive p-8">
        <AlertCircle className="w-8 h-8 mb-4" />
        <p className="text-center font-medium">Request Failed</p>
        <p className="text-sm text-center mt-2 text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
        <div className="text-center max-w-sm">
          <p className="text-lg font-medium mb-2">No Response Yet</p>
          <p className="text-sm">
            Enter a URL and click Send to see the response here.
          </p>
        </div>
      </div>
    );
  }

  const isJson = response.contentType.includes("application/json");
  const isImage = response.contentType.startsWith("image/");
  const isHtml = response.contentType.includes("text/html");

  let formattedBody = response.body;
  if (isJson) {
    try {
      formattedBody = JSON.stringify(JSON.parse(response.body), null, 2);
    } catch {
      // Keep original if parsing fails
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Status Bar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <span
            className={cn(
              "font-mono font-medium",
              getStatusClass(response.status)
            )}
          >
            {response.status} {response.statusText}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Time:</span>
          <span className="font-mono text-sm">
            {formatDuration(response.duration)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Size:</span>
          <span className="font-mono text-sm">{formatBytes(response.size)}</span>
        </div>
      </div>

      {/* Response Tabs */}
      <Tabs defaultValue="preview" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start px-4 shrink-0">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="raw">Raw</TabsTrigger>
          <TabsTrigger value="headers">
            Headers
            <span className="ml-1.5 text-xs bg-secondary px-1.5 py-0.5 rounded">
              {Object.keys(response.headers).length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Preview Tab */}
        <TabsContent value="preview" className="flex-1 overflow-hidden">
          {isImage ? (
            <div className="flex-1 flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:${response.contentType};base64,${btoa(response.body)}`}
                alt="Response"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : isHtml ? (
            <div className="flex-1 overflow-hidden p-4">
              {/* Use iframe to isolate HTML styles from our app */}
              <iframe
                srcDoc={htmlPreviewSrc}
                title="HTML Preview"
                className="w-full h-full border-0 rounded-md bg-white"
                sandbox="allow-same-origin"
              />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <MonacoEditor
                value={formattedBody}
                language={isJson ? "json" : "plaintext"}
                readOnly={true}
              />
            </div>
          )}
        </TabsContent>

        {/* Raw Tab */}
        <TabsContent value="raw" className="flex-1 overflow-hidden">
          <MonacoEditor
            value={response.body}
            language="plaintext"
            readOnly={true}
          />
        </TabsContent>

        {/* Headers Tab */}
        <TabsContent value="headers" className="flex-1 overflow-auto px-4 pb-4">
          <div className="space-y-1">
            {Object.entries(response.headers).map(([key, value]) => (
              <div
                key={key}
                className="flex gap-4 py-2 border-b border-border last:border-0"
              >
                <span className="font-mono text-sm text-primary font-medium min-w-[200px]">
                  {key}
                </span>
                <span className="font-mono text-sm text-muted-foreground break-all">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
