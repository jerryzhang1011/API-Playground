import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  HttpMethod,
  KeyValue,
  RequestState,
  ResponseData,
} from "@/types";

interface RequestStore {
  // Request State
  method: HttpMethod;
  url: string;
  headers: KeyValue[];
  params: KeyValue[];
  body: string;
  bodyType: "json" | "text" | "form-urlencoded" | "none";

  // Response State
  response: ResponseData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setBody: (body: string) => void;
  setBodyType: (type: "json" | "text" | "form-urlencoded" | "none") => void;

  // Headers
  addHeader: () => void;
  updateHeader: (id: string, field: "key" | "value", value: string) => void;
  toggleHeader: (id: string) => void;
  removeHeader: (id: string) => void;

  // Params
  addParam: () => void;
  updateParam: (id: string, field: "key" | "value", value: string) => void;
  toggleParam: (id: string) => void;
  removeParam: (id: string) => void;

  // Request Execution
  sendRequest: () => Promise<void>;
  abortRequest: () => void;

  // Utils
  getRequestState: () => RequestState;
  loadRequest: (request: RequestState) => void;
  reset: () => void;
}

let abortController: AbortController | null = null;

const initialHeaders: KeyValue[] = [
  { id: uuidv4(), key: "Content-Type", value: "application/json", enabled: true },
];

const initialParams: KeyValue[] = [];

export const useRequestStore = create<RequestStore>((set, get) => ({
  method: "GET",
  url: "",
  headers: initialHeaders,
  params: initialParams,
  body: "",
  bodyType: "json",
  response: null,
  isLoading: false,
  error: null,

  setMethod: (method) => set({ method }),
  setUrl: (url) => set({ url }),
  setBody: (body) => set({ body }),
  setBodyType: (bodyType) => set({ bodyType }),

  addHeader: () =>
    set((state) => ({
      headers: [
        ...state.headers,
        { id: uuidv4(), key: "", value: "", enabled: true },
      ],
    })),

  updateHeader: (id, field, value) =>
    set((state) => ({
      headers: state.headers.map((h) =>
        h.id === id ? { ...h, [field]: value } : h
      ),
    })),

  toggleHeader: (id) =>
    set((state) => ({
      headers: state.headers.map((h) =>
        h.id === id ? { ...h, enabled: !h.enabled } : h
      ),
    })),

  removeHeader: (id) =>
    set((state) => ({
      headers: state.headers.filter((h) => h.id !== id),
    })),

  addParam: () =>
    set((state) => ({
      params: [
        ...state.params,
        { id: uuidv4(), key: "", value: "", enabled: true },
      ],
    })),

  updateParam: (id, field, value) =>
    set((state) => ({
      params: state.params.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    })),

  toggleParam: (id) =>
    set((state) => ({
      params: state.params.map((p) =>
        p.id === id ? { ...p, enabled: !p.enabled } : p
      ),
    })),

  removeParam: (id) =>
    set((state) => ({
      params: state.params.filter((p) => p.id !== id),
    })),

  sendRequest: async () => {
    const state = get();
    if (!state.url) {
      set({ error: "URL is required" });
      return;
    }

    // Abort any existing request
    if (abortController) {
      abortController.abort();
    }

    abortController = new AbortController();
    set({ isLoading: true, error: null, response: null });

    const startTime = performance.now();

    try {
      // Build URL with query params
      let fullUrl = state.url;
      const enabledParams = state.params.filter((p) => p.enabled && p.key);
      if (enabledParams.length > 0) {
        const searchParams = new URLSearchParams();
        enabledParams.forEach((p) => searchParams.append(p.key, p.value));
        fullUrl += (fullUrl.includes("?") ? "&" : "?") + searchParams.toString();
      }

      // Build headers
      const headers: Record<string, string> = {};
      state.headers
        .filter((h) => h.enabled && h.key)
        .forEach((h) => {
          headers[h.key] = h.value;
        });

      // Call proxy endpoint
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: state.method,
          url: fullUrl,
          headers,
          body: state.method !== "GET" && state.bodyType !== "none" ? state.body : undefined,
        }),
        signal: abortController.signal,
      });

      const data = await res.json();
      const duration = performance.now() - startTime;

      if (data.error) {
        set({ error: data.error, isLoading: false });
        return;
      }

      set({
        response: {
          status: data.status,
          statusText: data.statusText,
          headers: data.headers,
          body: data.body,
          size: new Blob([data.body]).size,
          duration,
          contentType: data.headers["content-type"] || "text/plain",
        },
        isLoading: false,
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        set({ isLoading: false });
        return;
      }
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  abortRequest: () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    set({ isLoading: false });
  },

  getRequestState: () => {
    const state = get();
    return {
      method: state.method,
      url: state.url,
      headers: state.headers,
      params: state.params,
      body: state.body,
      bodyType: state.bodyType,
    };
  },

  loadRequest: (request) => {
    set({
      method: request.method,
      url: request.url,
      headers: request.headers,
      params: request.params,
      body: request.body,
      bodyType: request.bodyType,
      response: null,
      error: null,
    });
  },

  reset: () => {
    set({
      method: "GET",
      url: "",
      headers: initialHeaders,
      params: [],
      body: "",
      bodyType: "json",
      response: null,
      isLoading: false,
      error: null,
    });
  },
}));


