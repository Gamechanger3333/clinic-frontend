import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:3001";

async function handler(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const search = req.nextUrl.search;
  const url = `${BACKEND}${path}${search}`;

  const headers = new Headers();

  // Forward content-type
  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);

  // Forward cookie header for session passthrough
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) headers.set("cookie", cookieHeader);

  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? await req.arrayBuffer()
      : undefined;

  let backendRes: Response;
  try {
    backendRes = await fetch(url, {
      method: req.method,
      headers,
      body: body ? Buffer.from(body) : undefined,
    });
  } catch (err: any) {
    // Backend is unreachable (not running, wrong port, network error, etc.)
    console.error(`[proxy] Failed to reach backend at ${url}:`, err.message);
    return NextResponse.json(
      { error: "Backend service is unavailable. Please ensure the server is running." },
      { status: 503 }
    );
  }

  // Forward ALL response headers including Set-Cookie
  const resHeaders = new Headers();
  backendRes.headers.forEach((val, key) => {
    resHeaders.append(key, val);
  });

  const resBody = await backendRes.arrayBuffer();

  return new NextResponse(resBody, {
    status: backendRes.status,
    headers: resHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;