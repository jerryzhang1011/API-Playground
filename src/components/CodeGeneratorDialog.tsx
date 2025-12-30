"use client";

import { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRequestStore } from "@/store/requestStore";
import { MonacoEditor } from "./MonacoEditor";

interface CodeGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CodeLanguage = "typescript" | "javascript" | "python" | "curl";

export function CodeGeneratorDialog({
  open,
  onOpenChange,
}: CodeGeneratorDialogProps) {
  const [language, setLanguage] = useState<CodeLanguage>("typescript");
  const [copied, setCopied] = useState(false);
  const { getRequestState } = useRequestStore();

  const generatedCode = useMemo(() => {
    const state = getRequestState();
    return generateCode(state, language);
  }, [getRequestState, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMonacoLanguage = (lang: CodeLanguage) => {
    switch (lang) {
      case "typescript":
        return "typescript";
      case "javascript":
        return "javascript";
      case "python":
        return "python";
      case "curl":
        return "shell";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Generate Code</DialogTitle>
          <DialogDescription>
            Generate client code for your request in different languages.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-4">
          <Select value={language} onValueChange={(v) => setLanguage(v as CodeLanguage)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="curl">cURL</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleCopy} className="gap-2">
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>

        <div className="h-96 border rounded-md overflow-hidden">
          <MonacoEditor
            value={generatedCode}
            language={getMonacoLanguage(language)}
            readOnly={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface RequestStateForCodeGen {
  method: string;
  url: string;
  headers: { key: string; value: string; enabled: boolean }[];
  params: { key: string; value: string; enabled: boolean }[];
  body: string;
  bodyType: string;
}

function generateCode(state: RequestStateForCodeGen, language: CodeLanguage): string {
  const enabledHeaders = state.headers.filter((h) => h.enabled && h.key);
  const enabledParams = state.params.filter((p) => p.enabled && p.key);

  let fullUrl = state.url;
  if (enabledParams.length > 0) {
    const searchParams = new URLSearchParams();
    enabledParams.forEach((p) => searchParams.append(p.key, p.value));
    fullUrl += (fullUrl.includes("?") ? "&" : "?") + searchParams.toString();
  }

  switch (language) {
    case "typescript":
      return generateTypescript(state, fullUrl, enabledHeaders);
    case "javascript":
      return generateJavascript(state, fullUrl, enabledHeaders);
    case "python":
      return generatePython(state, fullUrl, enabledHeaders);
    case "curl":
      return generateCurl(state, fullUrl, enabledHeaders);
  }
}

function generateTypescript(
  state: RequestStateForCodeGen,
  fullUrl: string,
  headers: { key: string; value: string }[]
): string {
  const hasBody = state.method !== "GET" && state.bodyType !== "none" && state.body;
  const headersObj = headers.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

  let code = `interface RequestOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

async function makeRequest<T = unknown>(): Promise<ApiResponse<T>> {
  const url = "${fullUrl}";
  
  const options: RequestOptions = {
    method: "${state.method}",
    headers: ${JSON.stringify(headersObj, null, 4).split("\n").map((line, i) => i === 0 ? line : "    " + line).join("\n")},`;

  if (hasBody) {
    code += `
    body: ${JSON.stringify(state.body)},`;
  }

  code += `
  };

  const response = await fetch(url, options);
  const data = await response.json() as T;

  return {
    data,
    status: response.status,
    headers: response.headers,
  };
}

// Usage
makeRequest()
  .then((response) => {
    console.log("Status:", response.status);
    console.log("Data:", response.data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });`;

  return code;
}

function generateJavascript(
  state: RequestStateForCodeGen,
  fullUrl: string,
  headers: { key: string; value: string }[]
): string {
  const hasBody = state.method !== "GET" && state.bodyType !== "none" && state.body;
  const headersObj = headers.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

  let code = `async function makeRequest() {
  const url = "${fullUrl}";
  
  const options = {
    method: "${state.method}",
    headers: ${JSON.stringify(headersObj, null, 4).split("\n").map((line, i) => i === 0 ? line : "    " + line).join("\n")},`;

  if (hasBody) {
    code += `
    body: ${JSON.stringify(state.body)},`;
  }

  code += `
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log("Status:", response.status);
    console.log("Data:", data);
    
    return { data, status: response.status };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// Execute the request
makeRequest();`;

  return code;
}

function generatePython(
  state: RequestStateForCodeGen,
  fullUrl: string,
  headers: { key: string; value: string }[]
): string {
  const hasBody = state.method !== "GET" && state.bodyType !== "none" && state.body;
  const headersObj = headers.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

  let code = `import requests
import json

url = "${fullUrl}"

headers = ${JSON.stringify(headersObj, null, 4).replace(/"/g, "'")}
`;

  if (hasBody) {
    code += `
payload = ${state.body}
`;
  }

  code += `
try:
    response = requests.${state.method.toLowerCase()}(
        url,
        headers=headers,`;

  if (hasBody) {
    code += `
        json=payload,`;
  }

  code += `
    )
    
    print(f"Status: {response.status_code}")
    print(f"Data: {response.json()}")
    
except requests.exceptions.RequestException as error:
    print(f"Error: {error}")`;

  return code;
}

function generateCurl(
  state: RequestStateForCodeGen,
  fullUrl: string,
  headers: { key: string; value: string }[]
): string {
  const hasBody = state.method !== "GET" && state.bodyType !== "none" && state.body;

  let code = `curl -X ${state.method}`;

  headers.forEach((h) => {
    code += ` \\\n  -H '${h.key}: ${h.value}'`;
  });

  if (hasBody) {
    code += ` \\\n  -d '${state.body.replace(/'/g, "\\'")}'`;
  }

  code += ` \\\n  '${fullUrl}'`;

  return code;
}


