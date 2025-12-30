"use client";

import { useEffect, useCallback, useState } from "react";
import { Send, StopCircle, Copy, Code, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRequestStore } from "@/store/requestStore";
import { useHistoryStore } from "@/store/historyStore";
import { cn, getMethodClass } from "@/lib/utils";
import type { HttpMethod } from "@/types";
import { CodeGeneratorDialog } from "./CodeGeneratorDialog";

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

type Protocol = "https://" | "http://" | "custom";

export function UrlBar() {
  const {
    method,
    url,
    isLoading,
    setMethod,
    setUrl,
    sendRequest,
    abortRequest,
    getRequestState,
    response,
  } = useRequestStore();
  const { addToHistory } = useHistoryStore();

  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [protocol, setProtocol] = useState<Protocol>("https://");

  // Parse the URL to extract protocol and path
  const getUrlWithoutProtocol = (fullUrl: string) => {
    if (fullUrl.startsWith("https://")) {
      return fullUrl.slice(8);
    }
    if (fullUrl.startsWith("http://")) {
      return fullUrl.slice(7);
    }
    return fullUrl;
  };

  // Update protocol when URL changes externally (e.g., from history)
  useEffect(() => {
    if (url.startsWith("https://")) {
      setProtocol("https://");
    } else if (url.startsWith("http://")) {
      setProtocol("http://");
    } else if (url.includes("://")) {
      setProtocol("custom");
    }
  }, [url]);

  const handleProtocolChange = (newProtocol: Protocol) => {
    setProtocol(newProtocol);
    if (newProtocol !== "custom") {
      const pathOnly = getUrlWithoutProtocol(url);
      if (pathOnly) {
        setUrl(newProtocol + pathOnly);
      }
    }
  };

  const handleUrlChange = (value: string) => {
    if (protocol === "custom") {
      setUrl(value);
    } else {
      // If user pastes a full URL, detect and switch protocol
      if (value.startsWith("https://")) {
        setProtocol("https://");
        setUrl(value);
      } else if (value.startsWith("http://")) {
        setProtocol("http://");
        setUrl(value);
      } else {
        // User is typing path only, prepend protocol
        setUrl(protocol + value);
      }
    }
  };

  const displayUrl = protocol === "custom" ? url : getUrlWithoutProtocol(url);

  const handleSendRequest = useCallback(async () => {
    await sendRequest();
  }, [sendRequest]);

  // Add to history after successful request
  useEffect(() => {
    if (response && url) {
      const requestState = getRequestState();
      addToHistory(requestState, response);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  // Keyboard shortcut: Ctrl/Cmd + Enter to send
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isLoading) {
          handleSendRequest();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoading, handleSendRequest]);

  const generateCurl = () => {
    const state = getRequestState();
    let curl = `curl -X ${state.method}`;

    // Add headers
    state.headers
      .filter((h) => h.enabled && h.key)
      .forEach((h) => {
        curl += ` \\\n  -H '${h.key}: ${h.value}'`;
      });

    // Add body for non-GET requests
    if (state.method !== "GET" && state.body && state.bodyType !== "none") {
      curl += ` \\\n  -d '${state.body.replace(/'/g, "\\'")}'`;
    }

    // Add URL with params
    let fullUrl = state.url;
    const enabledParams = state.params.filter((p) => p.enabled && p.key);
    if (enabledParams.length > 0) {
      const searchParams = new URLSearchParams();
      enabledParams.forEach((p) => searchParams.append(p.key, p.value));
      fullUrl += (fullUrl.includes("?") ? "&" : "?") + searchParams.toString();
    }

    curl += ` \\\n  '${fullUrl}'`;

    return curl;
  };

  const copyCurl = async () => {
    const curl = generateCurl();
    await navigator.clipboard.writeText(curl);
  };

  return (
    <>
      <TooltipProvider>
        <div className="flex items-center gap-2 p-4 border-b border-border bg-card/50">
          {/* Method Selector */}
          <Select value={method} onValueChange={(v) => setMethod(v as HttpMethod)}>
            <SelectTrigger className={cn("w-28 font-mono font-medium", getMethodClass(method))}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HTTP_METHODS.map((m) => (
                <SelectItem key={m} value={m} className={cn("font-mono", getMethodClass(m))}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Protocol Selector + URL Input */}
          <div className="flex-1 flex items-center">
            {/* Protocol Dropdown */}
            <Select value={protocol} onValueChange={(v) => handleProtocolChange(v as Protocol)}>
              <SelectTrigger className="w-[110px] rounded-r-none border-r-0 font-mono text-sm text-muted-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="https://" className="font-mono text-sm">
                  https://
                </SelectItem>
                <SelectItem value="http://" className="font-mono text-sm">
                  http://
                </SelectItem>
                <SelectItem value="custom" className="font-mono text-sm">
                  custom
                </SelectItem>
              </SelectContent>
            </Select>

            {/* URL Input */}
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder={protocol === "custom" ? "Enter full URL" : "api.example.com/users"}
                value={displayUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="font-mono text-sm pr-20 rounded-l-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleSendRequest();
                  }
                }}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={copyCurl}
                      disabled={!url}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy as cURL</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setCodeDialogOpen(true)}
                      disabled={!url}
                    >
                      <Code className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Generate Code</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Send / Cancel Button */}
          {isLoading ? (
            <Button variant="destructive" onClick={abortRequest} className="gap-2">
              <StopCircle className="w-4 h-4" />
              Cancel
            </Button>
          ) : (
            <Button onClick={handleSendRequest} disabled={!url} className="gap-2">
              <Send className="w-4 h-4" />
              Send
            </Button>
          )}

          {/* Keyboard shortcut hint */}
          <span className="text-xs text-muted-foreground hidden md:inline">
            ⌘+Enter
          </span>
        </div>
      </TooltipProvider>

      <CodeGeneratorDialog
        open={codeDialogOpen}
        onOpenChange={setCodeDialogOpen}
      />
    </>
  );
}
