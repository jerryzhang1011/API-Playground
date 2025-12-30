import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { ImportedAPI, OpenAPIOperation, HttpMethod } from "@/types";

interface OpenAPIStore {
  importedApis: ImportedAPI[];
  isImporting: boolean;
  importError: string | null;

  // Actions
  importFromUrl: (url: string) => Promise<void>;
  importFromText: (text: string, name?: string) => Promise<void>;
  removeApi: (id: string) => void;
  clearAll: () => void;
}

function parseOpenApiSpec(spec: Record<string, unknown>): {
  name: string;
  baseUrl: string;
  operations: OpenAPIOperation[];
} {
  const info = spec.info as { title?: string; version?: string } | undefined;
  const name = info?.title || "Untitled API";
  
  const servers = spec.servers as { url?: string }[] | undefined;
  const baseUrl = servers?.[0]?.url || "";

  const operations: OpenAPIOperation[] = [];
  const paths = spec.paths as Record<string, Record<string, unknown>> | undefined;

  if (paths) {
    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        if (["get", "post", "put", "patch", "delete"].includes(method.toLowerCase())) {
          const op = operation as Record<string, unknown>;
          operations.push({
            path,
            method: method.toUpperCase() as HttpMethod,
            summary: op.summary as string | undefined,
            description: op.description as string | undefined,
            operationId: op.operationId as string | undefined,
            parameters: op.parameters as OpenAPIOperation["parameters"],
            requestBody: op.requestBody as OpenAPIOperation["requestBody"],
          });
        }
      }
    }
  }

  return { name, baseUrl, operations };
}

export const useOpenAPIStore = create<OpenAPIStore>((set) => ({
  importedApis: [],
  isImporting: false,
  importError: null,

  importFromUrl: async (url: string) => {
    set({ isImporting: true, importError: null });

    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "GET", url, headers: {} }),
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      let spec: Record<string, unknown>;
      try {
        spec = JSON.parse(data.body);
      } catch {
        // Try YAML parsing
        const yaml = await import("yaml");
        spec = yaml.parse(data.body);
      }

      const parsed = parseOpenApiSpec(spec);

      set((state) => ({
        importedApis: [
          ...state.importedApis,
          { id: uuidv4(), ...parsed },
        ],
        isImporting: false,
      }));
    } catch (e) {
      set({ importError: (e as Error).message, isImporting: false });
    }
  },

  importFromText: async (text: string, name?: string) => {
    set({ isImporting: true, importError: null });

    try {
      let spec: Record<string, unknown>;
      try {
        spec = JSON.parse(text);
      } catch {
        const yaml = await import("yaml");
        spec = yaml.parse(text);
      }

      const parsed = parseOpenApiSpec(spec);

      set((state) => ({
        importedApis: [
          ...state.importedApis,
          { id: uuidv4(), name: name || parsed.name, baseUrl: parsed.baseUrl, operations: parsed.operations },
        ],
        isImporting: false,
      }));
    } catch (e) {
      set({ importError: (e as Error).message, isImporting: false });
    }
  },

  removeApi: (id) => {
    set((state) => ({
      importedApis: state.importedApis.filter((api) => api.id !== id),
    }));
  },

  clearAll: () => {
    set({ importedApis: [] });
  },
}));


