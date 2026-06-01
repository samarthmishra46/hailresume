// Runs once when the Next.js server starts.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Prefer IPv4 when resolving hostnames. Without this, Node's fetch (undici)
    // may pick an IPv6 address the machine can't route, causing the request to
    // hang until it times out (UND_ERR_CONNECT_TIMEOUT) — e.g. when reaching
    // Supabase/Cloudflare. Browsers are unaffected, which makes it look code-related.
    const dns = await import("node:dns");
    dns.setDefaultResultOrder("ipv4first");

    // Raise the timeouts on Node's global fetch (used by the Supabase client).
    // Default undici connect timeout is 10s — too short on slow links.
    const { setGlobalDispatcher, Agent } = await import("undici");
    setGlobalDispatcher(
      new Agent({
        connect: { timeout: 30_000 }, // TCP connect timeout
        headersTimeout: 60_000,
        bodyTimeout: 60_000,
      }),
    );
  }
}
