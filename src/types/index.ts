export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface KeyValue {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestState {
  method: HttpMethod;
  url: string;
  headers: KeyValue[];
  params: KeyValue[];
  body: string;
  bodyType: "json" | "text" | "form-urlencoded" | "none";
}

export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  size: number;
  duration: number;
  contentType: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  method: HttpMethod;
  url: string;
  request: RequestState;
  response?: ResponseData;
  name?: string;
  starred?: boolean;
}

export interface OpenAPIOperation {
  path: string;
  method: HttpMethod;
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: OpenAPIParameter[];
  requestBody?: {
    content?: Record<string, { schema?: unknown; example?: unknown }>;
  };
}

export interface OpenAPIParameter {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  required?: boolean;
  schema?: { type?: string; default?: unknown };
  description?: string;
}

export interface OpenAPISpec {
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: { url: string; description?: string }[];
  paths: Record<string, Record<string, OpenAPIOperation>>;
}

export interface ImportedAPI {
  id: string;
  name: string;
  baseUrl: string;
  operations: OpenAPIOperation[];
}


