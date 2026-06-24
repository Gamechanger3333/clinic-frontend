import { NextRequest, NextResponse } from "next/server";

const BACKEND = "http://localhost:3001";

async function handler(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const search = req.nextUrl.search;
  const url = `${BACKEND}${path}${search}`;

  const headers = new Headers();

  // Forward content-type
  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);

  // Forward cookie header directly from the incoming request
  // This works for both server-side and client-side fetch calls
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) headers.set("cookie", cookieHeader);

  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? await req.arrayBuffer()
      : undefined;

  const backendRes = await fetch(url, {
    method: req.method,
    headers,
    body: body ? Buffer.from(body) : undefined,
  });

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
