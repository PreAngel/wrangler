# 🪽 PreAngel Proxy — Multi-Domain Cloudflare Worker

**Domains:**

* [https://pre-angel.com](https://pre-angel.com)
* [https://preangel.ai](https://preangel.ai)

This repository contains the full source and CI/CD configuration for the **PreAngel Edge Proxy**, a Cloudflare Worker that transparently serves GitHub Pages content to multiple domains with domain-specific branding and edge caching.

---

## ⚡ Quick Start

### 🧰 Prerequisites

* Cloudflare account with both domains (`pre-angel.com`, `preangel.ai`) in DNS.
* [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed.
* Node.js ≥ 18 and Git installed.

### 🚀 Setup in 5 Minutes

```bash
# 1. Clone this repo
 git clone https://github.com/huan/preangel-proxy.git
 cd preangel-proxy

# 2. Authenticate with Cloudflare
 wrangler login

# 3. Deploy the Worker
 wrangler deploy

# 4. (Optional) Tail logs in real time
 wrangler tail preangel-proxy
```

That’s it! Your Worker will automatically serve both domains through Cloudflare’s global CDN.

---

## 🌍 Overview

The goal of this project is to host the same GitHub Pages site under **two domains** — `pre-angel.com` and `preangel.ai` — while keeping the browser URL unchanged for branding consistency.

We achieve this using a **Cloudflare Worker reverse proxy** with global caching and HTML rewriting.

### Key Features

* **Transparent proxy** — serves `huan.github.io` content without redirects.
* **Multi-domain branding** — custom titles, meta descriptions, and canonical tags per domain.
* **Edge caching** — leverages Cloudflare’s global CDN for ultra-fast delivery.
* **SEO-safe canonical links** — prevent duplicate-content penalties.
* **CI/CD via GitHub** — automatic deployment on `git push`.

---

## 🧱 Architecture

```
Browser → Cloudflare Edge → Worker (preangel-proxy) → GitHub Pages (huan.github.io)
```

* The Worker runs at Cloudflare’s edge (310+ PoPs worldwide).
* It rewrites incoming requests, fetches from GitHub Pages, injects domain-specific HTML, and caches responses at the edge.
* Both `pre-angel.com` and `preangel.ai` map to the same Worker.

---

## ⚙️ Implementation Details

### Worker Core (HTMLRewriter Version)

The Worker uses Cloudflare’s streaming **HTMLRewriter** API to modify the HTML `<head>` for each domain:

```js
.on("title", e => e.setInnerContent(siteMeta.title))
.on("head", e => e.append(`
  <meta name="theme-color" content="${siteMeta.color}">
  <meta name="description" content="${siteMeta.desc}">
  <link rel="canonical" href="https://${host}${path}">
`, { html: true }))
```

### Edge Cache

Each response is cached using `caches.default` for 10 minutes (`max-age=600`), plus `stale-while-revalidate=60` for smooth background refresh.

```js
ctx.waitUntil(cache.put(request, response.clone()))
```

This means Cloudflare will serve subsequent requests directly from the nearest data center.

---

## 🚀 Deployment Flow

1. **Local Setup**

   ```bash
   npm install -g wrangler
   wrangler login
   wrangler init --from-dash preangel-proxy
   ```

2. **Connect to GitHub**

   * Push this folder to GitHub: `huan/preangel-proxy`.
   * In Cloudflare → Workers → *preangel-proxy* → **Connect to GitHub**.
   * Select branch `main` for automatic deployments.

3. **Custom Domains**

   * Add both `pre-angel.com` and `preangel.ai` under **Triggers → Custom Domains**.

4. **Deploy manually (optional)**

   ```bash
   wrangler deploy
   ```

5. **Real-time logs**

   ```bash
   wrangler tail preangel-proxy
   ```

---

## 🧩 Repository Layout

```
preangel-proxy/
├─ src/
│  └─ index.js          # Worker code (HTMLRewriter proxy)
├─ wrangler.toml        # Cloudflare config (routes + domains)
├─ package.json         # Optional npm deps
├─ .github/workflows/   # GitHub Actions CI/CD
│  └─ deploy.yml
└─ README.md            # (this file)
```

### Example `wrangler.toml`

```toml
name = "preangel-proxy"
main = "src/index.js"
compatibility_date = "2025-11-10"

routes = [
  { pattern = "pre-angel.com/*", custom_domain = true },
  { pattern = "preangel.ai/*", custom_domain = true }
]
```

---

## 📊 Observability

Cloudflare provides analytics across layers:

* **Workers Analytics:** latency, requests, subrequests, CPU time
* **Cache Analytics:** edge cache hit ratios
* **Zone Analytics:** traffic and threats per domain

### Real-Time Logs

```bash
wrangler tail preangel-proxy
```

### Advanced Query Example (Analytics Engine)

```sql
SELECT
  host,
  COUNT(*) AS requests,
  AVG(http.request_latency_ms) AS avg_latency,
  SUM(CASE WHEN cache.status='hit' THEN 1 ELSE 0 END) / COUNT(*) AS hit_ratio
FROM worker_requests
WHERE datetime > NOW() - INTERVAL 1 DAY
GROUP BY host;
```

---

## 🧠 Design Philosophy

* Keep branding consistent across multiple domains.
* Avoid redirects — preserve the original host in the URL.
* Optimize latency and SEO simultaneously.
* Make everything reproducible via GitHub CI/CD.

---

## 💡 Future Enhancements

* Add per-domain analytics dashboards (Grafana template)
* Integrate with Cloudflare KV or D1 for dynamic content
* Use durable objects for cross-domain session persistence
* Edge A/B testing with personalized meta injection

---

## 🪶 Credits

Built by **Huan Li (@huan)** under **PreAngel LLC**, with ❤️ for open web infrastructure.

> "Keep your domains elegant, your cache hot, and your latency low." — PreAngel
