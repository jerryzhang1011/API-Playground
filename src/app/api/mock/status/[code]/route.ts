import { NextRequest, NextResponse } from "next/server";

const statusMessages: Record<number, string> = {
  200: "OK",
  201: "Created",
  204: "No Content",
  301: "Moved Permanently",
  302: "Found",
  304: "Not Modified",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  408: "Request Timeout",
  409: "Conflict",
  422: "Unprocessable Entity",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = parseInt(params.code) || 200;
  const message = statusMessages[code] || "Unknown Status";

  return NextResponse.json(
    {
      status: code,
      message,
      timestamp: new Date().toISOString(),
    },
    { status: code }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  return GET(request, { params });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  return GET(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  return GET(request, { params });
}


