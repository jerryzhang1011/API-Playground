import { NextRequest, NextResponse } from "next/server";

interface ProxyRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

// Forbidden headers that shouldn't be forwarded
const FORBIDDEN_REQUEST_HEADERS = [
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
];

// Headers to strip from response
const FORBIDDEN_RESPONSE_HEADERS = [
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
];

// Check if URL is our own mock API
function isLocalMockApi(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
    const isMockPath = parsed.pathname.startsWith("/api/mock");
    return isLocalhost && isMockPath;
  } catch {
    return false;
  }
}

// Check if URL is potentially dangerous (SSRF protection)
function isValidUrl(url: string): { valid: boolean; reason?: string } {
  try {
    const parsed = new URL(url);

    // Only allow http and https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, reason: "Only HTTP and HTTPS protocols are allowed" };
    }

    // Allow our own mock APIs on localhost
    if (isLocalMockApi(url)) {
      return { valid: true };
    }

    // Block localhost and private IPs for external requests
    const hostname = parsed.hostname.toLowerCase();
    
    // Block localhost
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
      return { valid: false, reason: "Localhost is not allowed (except /api/mock endpoints)" };
    }

    // Block private IP ranges (basic check)
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^169\.254\./,
      /^0\./,
    ];

    if (privateRanges.some((range) => range.test(hostname))) {
      return { valid: false, reason: "Private IP addresses are not allowed" };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "Invalid URL format" };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ProxyRequest = await request.json();
    const { method, url, headers, body: requestBody } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL (SSRF protection)
    const urlValidation = isValidUrl(url);
    if (!urlValidation.valid) {
      return NextResponse.json(
        { error: urlValidation.reason },
        { status: 400 }
      );
    }

    // Filter out forbidden headers
    const filteredHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers || {})) {
      if (!FORBIDDEN_REQUEST_HEADERS.includes(key.toLowerCase())) {
        filteredHeaders[key] = value;
      }
    }

    // Set timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(url, {
        method,
        headers: filteredHeaders,
        body: method !== "GET" && method !== "HEAD" ? requestBody : undefined,
        signal: controller.signal,
        redirect: "follow",
      });

      clearTimeout(timeoutId);

      // Get response body as text
      const responseBody = await response.text();

      // Limit response size (10MB)
      if (responseBody.length > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Response too large (max 10MB)" },
          { status: 413 }
        );
      }

      // Extract response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        if (!FORBIDDEN_RESPONSE_HEADERS.includes(key.toLowerCase())) {
          responseHeaders[key] = value;
        }
      });

      return NextResponse.json({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if ((fetchError as Error).name === "AbortError") {
        return NextResponse.json(
          { error: "Request timed out (30s limit)" },
          { status: 408 }
        );
      }

      throw fetchError;
    }
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to proxy request" },
      { status: 500 }
    );
  }
}
