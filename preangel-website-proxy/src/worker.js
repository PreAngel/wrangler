/**
 * Cloudflare Worker: PreAngel-Proxy
 * Transparent reverse proxy for GitHub Pages
 */

export default {
  async fetch(request, env, ctx) {
    const upstream = new URL(request.url)
    upstream.hostname = "preangel.github.io"
    // upstream.pathname = "/pre-angel.com" + upstream.pathname   // project page

    // Edge cache
    const cache = caches.default
    let response = await cache.match(request)
    if (!response) {
      response = await fetch(upstream.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: "follow",
      })

      // Add simple cache control + marker
      const newHeaders = new Headers(response.headers)
      newHeaders.set(
        "Cache-Control",
        "public, max-age=600, stale-while-revalidate=60"
      )
      newHeaders.set("X-Proxy-By", "Cloudflare Worker: PreAngel-Proxy")

      response = new Response(response.body, {
        status: response.status,
        headers: newHeaders,
      })
      ctx.waitUntil(cache.put(request, response.clone()))
    }

    return response
  },
}