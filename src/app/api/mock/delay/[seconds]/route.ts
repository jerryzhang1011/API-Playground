import { NextRequest, NextResponse } from "next/server";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(
  request: NextRequest,
  { params }: { params: { seconds: string } }
) {
  const seconds = Math.min(parseInt(params.seconds) || 1, 30); // Max 30 seconds

  await sleep(seconds * 1000);

  return NextResponse.json({
    message: `Delayed response after ${seconds} seconds`,
    delay: seconds,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { seconds: string } }
) {
  return GET(request, { params });
}


