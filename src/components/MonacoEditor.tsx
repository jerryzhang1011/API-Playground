"use client";

import Editor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

interface MonacoEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
}

export function MonacoEditor({
  value,
  onChange,
  language = "json",
  readOnly = false,
  height = "100%",
}: MonacoEditorProps) {
  return (
    <Editor
      height={height}
      defaultLanguage={language}
      language={language}
      value={value}
      onChange={(val) => onChange?.(val || "")}
      theme="vs-dark"
      loading={
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      }
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: "var(--font-geist-mono), monospace",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
        folding: true,
        renderLineHighlight: "none",
        overviewRulerBorder: false,
        hideCursorInOverviewRuler: true,
        scrollbar: {
          vertical: "auto",
          horizontal: "auto",
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
        },
        padding: {
          top: 12,
          bottom: 12,
        },
      }}
    />
  );
}


