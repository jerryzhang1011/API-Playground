"use client";

import { useEffect, useState } from "react";
import {
  History,
  Star,
  Trash2,
  ChevronRight,
  ChevronDown,
  FileJson,
  Plus,
  X,
  Folder,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHistoryStore } from "@/store/historyStore";
import { useRequestStore } from "@/store/requestStore";
import { useOpenAPIStore } from "@/store/openApiStore";
import { cn, getMethodClass } from "@/lib/utils";
import type { HistoryItem, OpenAPIOperation, HttpMethod } from "@/types";
import { ImportOpenAPIDialog } from "./ImportOpenAPIDialog";

interface MockEndpoint {
  method: HttpMethod;
  path: string;
  description: string;
}

const MOCK_ENDPOINTS: MockEndpoint[] = [
  { method: "GET", path: "/api/mock/posts", description: "Get all posts" },
  { method: "GET", path: "/api/mock/posts/1", description: "Get post by ID" },
  { method: "POST", path: "/api/mock/posts", description: "Create post" },
  { method: "GET", path: "/api/mock/users", description: "Get all users" },
  { method: "GET", path: "/api/mock/echo", description: "Echo request" },
  { method: "POST", path: "/api/mock/echo", description: "Echo with body" },
  { method: "GET", path: "/api/mock/delay/2", description: "2s delay" },
  { method: "GET", path: "/api/mock/status/200", description: "Status 200" },
  { method: "GET", path: "/api/mock/status/404", description: "Status 404" },
  { method: "GET", path: "/api/mock/status/500", description: "Status 500" },
];

export function Sidebar() {
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [collectionsExpanded, setCollectionsExpanded] = useState(true);
  const [mockExpanded, setMockExpanded] = useState(true);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const { items, isLoaded, loadHistory, removeFromHistory, clearHistory, toggleStar } =
    useHistoryStore();
  const { loadRequest, setUrl, setMethod } = useRequestStore();
  const { importedApis, removeApi } = useOpenAPIStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleRestoreHistory = (item: HistoryItem) => {
    loadRequest(item.request);
  };

  const handleLoadMockEndpoint = (endpoint: MockEndpoint) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    setMethod(endpoint.method);
    setUrl(baseUrl + endpoint.path);
    
    // For POST endpoints, load sample body
    if (endpoint.method === "POST" && endpoint.path.includes("/posts")) {
      loadRequest({
        method: "POST",
        url: baseUrl + endpoint.path,
        headers: [{ id: "1", key: "Content-Type", value: "application/json", enabled: true }],
        params: [],
        body: JSON.stringify({ title: "My Post", body: "This is the content", userId: 1 }, null, 2),
        bodyType: "json",
      });
    }
  };

  const handleLoadOperation = (operation: OpenAPIOperation, baseUrl: string) => {
    const url = baseUrl + operation.path;
    let body = "";
    
    if (operation.requestBody?.content) {
      const jsonContent = operation.requestBody.content["application/json"];
      if (jsonContent?.example) {
        body = JSON.stringify(jsonContent.example, null, 2);
      }
    }

    loadRequest({
      method: operation.method,
      url,
      headers: [{ id: "1", key: "Content-Type", value: "application/json", enabled: true }],
      params: [],
      body,
      bodyType: "json",
    });
  };

  const groupHistoryByDate = (items: HistoryItem[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const starred: HistoryItem[] = [];
    const todayItems: HistoryItem[] = [];
    const yesterdayItems: HistoryItem[] = [];
    const olderItems: HistoryItem[] = [];

    items.forEach((item) => {
      if (item.starred) {
        starred.push(item);
        return;
      }
      const itemDate = new Date(item.timestamp);
      if (itemDate >= today) {
        todayItems.push(item);
      } else if (itemDate >= yesterday) {
        yesterdayItems.push(item);
      } else {
        olderItems.push(item);
      }
    });

    return { starred, todayItems, yesterdayItems, olderItems };
  };

  const { starred, todayItems, yesterdayItems, olderItems } = groupHistoryByDate(items);

  return (
    <>
      <aside className="w-72 border-r border-border bg-card flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <FileJson className="w-4 h-4 text-primary" />
            </div>
            API Playground
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Mock APIs Section */}
          <div className="border-b border-border">
            <button
              onClick={() => setMockExpanded(!mockExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-amber-500">Mock APIs</span>
                <span className="text-xs bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded">
                  {MOCK_ENDPOINTS.length}
                </span>
              </span>
              {mockExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {mockExpanded && (
              <div className="pb-2 px-2">
                <div className="space-y-0.5">
                  {MOCK_ENDPOINTS.map((endpoint, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLoadMockEndpoint(endpoint)}
                      className="w-full px-2 py-1.5 flex items-center gap-2 text-sm hover:bg-secondary rounded transition-colors"
                    >
                      <span
                        className={cn(
                          "text-xs font-mono font-medium px-1.5 py-0.5 rounded shrink-0",
                          getMethodClass(endpoint.method)
                        )}
                      >
                        {endpoint.method}
                      </span>
                      <span className="text-muted-foreground truncate text-xs">
                        {endpoint.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* History Section */}
          <div className="border-b border-border">
            <button
              onClick={() => setHistoryExpanded(!historyExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-2">
                <History className="w-4 h-4" />
                History
                <span className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                  {items.length}
                </span>
              </span>
              {historyExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {historyExpanded && isLoaded && (
              <div className="pb-2">
                {items.length === 0 ? (
                  <p className="px-4 py-2 text-sm text-muted-foreground">
                    No requests yet
                  </p>
                ) : (
                  <>
                    {/* Starred */}
                    {starred.length > 0 && (
                      <HistoryGroup
                        title="Starred"
                        items={starred}
                        onRestore={handleRestoreHistory}
                        onDelete={removeFromHistory}
                        onToggleStar={toggleStar}
                      />
                    )}
                    {/* Today */}
                    {todayItems.length > 0 && (
                      <HistoryGroup
                        title="Today"
                        items={todayItems}
                        onRestore={handleRestoreHistory}
                        onDelete={removeFromHistory}
                        onToggleStar={toggleStar}
                      />
                    )}
                    {/* Yesterday */}
                    {yesterdayItems.length > 0 && (
                      <HistoryGroup
                        title="Yesterday"
                        items={yesterdayItems}
                        onRestore={handleRestoreHistory}
                        onDelete={removeFromHistory}
                        onToggleStar={toggleStar}
                      />
                    )}
                    {/* Older */}
                    {olderItems.length > 0 && (
                      <HistoryGroup
                        title="Older"
                        items={olderItems}
                        onRestore={handleRestoreHistory}
                        onDelete={removeFromHistory}
                        onToggleStar={toggleStar}
                      />
                    )}

                    {/* Clear All Button */}
                    <div className="px-4 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={clearHistory}
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Clear History
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Collections / OpenAPI Section */}
          <div>
            <button
              onClick={() => setCollectionsExpanded(!collectionsExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Collections
                <span className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                  {importedApis.length}
                </span>
              </span>
              {collectionsExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {collectionsExpanded && (
              <div className="pb-2">
                <div className="px-4 pb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setImportDialogOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Import OpenAPI
                  </Button>
                </div>

                {importedApis.length === 0 ? (
                  <p className="px-4 py-2 text-sm text-muted-foreground">
                    No APIs imported
                  </p>
                ) : (
                  importedApis.map((api) => (
                    <div key={api.id} className="px-2">
                      <div className="flex items-center justify-between px-2 py-1">
                        <span className="text-sm font-medium text-foreground truncate flex-1">
                          {api.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeApi(api.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="space-y-0.5">
                        {api.operations.slice(0, 10).map((op, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleLoadOperation(op, api.baseUrl)}
                            className="w-full px-2 py-1.5 flex items-center gap-2 text-sm hover:bg-secondary rounded transition-colors"
                          >
                            <span
                              className={cn(
                                "text-xs font-mono font-medium px-1.5 py-0.5 rounded",
                                getMethodClass(op.method)
                              )}
                            >
                              {op.method}
                            </span>
                            <span className="text-muted-foreground truncate">
                              {op.path}
                            </span>
                          </button>
                        ))}
                        {api.operations.length > 10 && (
                          <p className="px-2 py-1 text-xs text-muted-foreground">
                            +{api.operations.length - 10} more
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border text-xs text-muted-foreground">
          <p>Storage: {items.length}/50 requests</p>
        </div>
      </aside>

      <ImportOpenAPIDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </>
  );
}

interface HistoryGroupProps {
  title: string;
  items: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
}

function HistoryGroup({
  title,
  items,
  onRestore,
  onDelete,
  onToggleStar,
}: HistoryGroupProps) {
  return (
    <div className="px-2">
      <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-1 px-2 py-1.5 hover:bg-secondary rounded transition-colors"
          >
            <button
              onClick={() => onRestore(item)}
              className="flex-1 flex items-center gap-2 text-left overflow-hidden"
            >
              <span
                className={cn(
                  "text-xs font-mono font-medium px-1.5 py-0.5 rounded shrink-0",
                  getMethodClass(item.method)
                )}
              >
                {item.method}
              </span>
              <span className="text-sm text-muted-foreground truncate">
                {item.name || new URL(item.url).pathname}
              </span>
            </button>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onToggleStar(item.id)}
              >
                <Star
                  className={cn(
                    "w-3 h-3",
                    item.starred
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  )}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
