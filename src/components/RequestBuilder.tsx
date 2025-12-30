"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRequestStore } from "@/store/requestStore";
import { MonacoEditor } from "./MonacoEditor";
import { cn } from "@/lib/utils";

export function RequestBuilder() {
  const {
    method,
    headers,
    params,
    body,
    bodyType,
    setBody,
    setBodyType,
    addHeader,
    updateHeader,
    toggleHeader,
    removeHeader,
    addParam,
    updateParam,
    toggleParam,
    removeParam,
  } = useRequestStore();

  const showBodyTab = method !== "GET";

  return (
    <Tabs defaultValue="params" className="flex-1 flex flex-col">
      <TabsList className="w-full justify-start px-4 shrink-0">
        <TabsTrigger value="params">
          Params
          {params.filter((p) => p.enabled && p.key).length > 0 && (
            <span className="ml-1.5 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
              {params.filter((p) => p.enabled && p.key).length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="headers">
          Headers
          {headers.filter((h) => h.enabled && h.key).length > 0 && (
            <span className="ml-1.5 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
              {headers.filter((h) => h.enabled && h.key).length}
            </span>
          )}
        </TabsTrigger>
        {showBodyTab && <TabsTrigger value="body">Body</TabsTrigger>}
      </TabsList>

      {/* Params Tab */}
      <TabsContent value="params" className="px-4 pb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Query Parameters</p>
            <Button variant="ghost" size="sm" onClick={addParam}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {params.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No query parameters. Click &quot;Add&quot; to create one.
              </p>
            ) : (
              params.map((param) => (
                <div key={param.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={param.enabled}
                    onChange={() => toggleParam(param.id)}
                    className="w-4 h-4 rounded border-input bg-background"
                  />
                  <Input
                    placeholder="Key"
                    value={param.key}
                    onChange={(e) =>
                      updateParam(param.id, "key", e.target.value)
                    }
                    className={cn(
                      "flex-1 font-mono text-sm",
                      !param.enabled && "opacity-50"
                    )}
                  />
                  <Input
                    placeholder="Value"
                    value={param.value}
                    onChange={(e) =>
                      updateParam(param.id, "value", e.target.value)
                    }
                    className={cn(
                      "flex-1 font-mono text-sm",
                      !param.enabled && "opacity-50"
                    )}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeParam(param.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </TabsContent>

      {/* Headers Tab */}
      <TabsContent value="headers" className="px-4 pb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Request Headers</p>
            <Button variant="ghost" size="sm" onClick={addHeader}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {headers.map((header) => (
              <div key={header.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={header.enabled}
                  onChange={() => toggleHeader(header.id)}
                  className="w-4 h-4 rounded border-input bg-background"
                />
                <Input
                  placeholder="Header name"
                  value={header.key}
                  onChange={(e) =>
                    updateHeader(header.id, "key", e.target.value)
                  }
                  className={cn(
                    "flex-1 font-mono text-sm",
                    !header.enabled && "opacity-50"
                  )}
                />
                <Input
                  placeholder="Value"
                  value={header.value}
                  onChange={(e) =>
                    updateHeader(header.id, "value", e.target.value)
                  }
                  className={cn(
                    "flex-1 font-mono text-sm",
                    !header.enabled && "opacity-50"
                  )}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeHeader(header.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>

      {/* Body Tab */}
      {showBodyTab && (
        <TabsContent value="body" className="px-4 pb-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Request Body</p>
            <Select
              value={bodyType}
              onValueChange={(v) =>
                setBodyType(v as "json" | "text" | "form-urlencoded" | "none")
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="form-urlencoded">x-www-form-urlencoded</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {bodyType !== "none" && (
            <div className="flex-1 min-h-[200px] border rounded-md overflow-hidden">
              <MonacoEditor
                value={body}
                onChange={setBody}
                language={bodyType === "json" ? "json" : "plaintext"}
                readOnly={false}
              />
            </div>
          )}

          {bodyType === "none" && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>This request does not have a body</p>
            </div>
          )}
        </TabsContent>
      )}
    </Tabs>
  );
}


