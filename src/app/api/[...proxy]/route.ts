import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:3001";

async function handler(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const search = req.nextUrl.search;
  const url = `${BACKEND}${path}${search}`;

  const headers = new Headers();

  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);

  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) headers.set("cookie", cookieHeader);

  // Tell backend NOT to compress — proxy can't decompress gzip
  headers.set("accept-encoding", "identity");

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
    console.error(`[proxy] Failed to reach backend at ${url}:`, err.message);
    return NextResponse.json(
      { error: "Backend service is unavailable. Please ensure the server is running." },
      { status: 503 }
    );
  }

  // Forward headers — set-cookie alag handle karo
  const resHeaders = new Headers();
  backendRes.headers.forEach((val, key) => {
    if (key.toLowerCase() === "set-cookie") return;
    if (key.toLowerCase() === "content-encoding") return; // gzip header mat bhejo
    resHeaders.append(key, val);
  });

  const resBody = await backendRes.arrayBuffer();

  const response = new NextResponse(resBody, {
    status: backendRes.status,
    headers: resHeaders,
  });

  // Har cookie alag alag append karo
  const cookies = backendRes.headers.getSetCookie?.() ?? [];
  for (const cookie of cookies) {
    response.headers.append("set-cookie", cookie);
  }

  return response;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;