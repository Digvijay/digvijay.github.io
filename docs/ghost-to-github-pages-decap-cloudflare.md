# Migrating Ghost to GitHub Pages with Decap CMS and Cloudflare

This guide explains how to migrate a self-hosted Ghost blog to **GitHub Pages** with a homepage at `digvijay.dev`, a blog at `digvijay.dev/blog`, and seamless **WWW and non-WWW domain redirection** using Cloudflare.

---

## 1. Domain & URL Structure

- **Landing Homepage**: `https://digvijay.dev/`
- **Blog Listing**: `https://digvijay.dev/blog/`
- **Decap CMS Editor**: `https://digvijay.dev/admin/`
- **WWW Handling**: `https://www.digvijay.dev/*` automatically redirects to `https://digvijay.dev/*`.

---

## 2. Cloudflare DNS & Redirect Configuration

### DNS Records in Cloudflare:
| Type | Name | Target | Proxy Status |
| :--- | :--- | :--- | :--- |
| `CNAME` | `@` | `<github-username>.github.io` | Proxied (Orange Cloud) |
| `CNAME` | `www` | `<github-username>.github.io` | Proxied (Orange Cloud) |

### Page Rule / Redirect Rule (WWW -> Non-WWW):
1. In Cloudflare Dashboard, go to **Rules > Redirect Rules > Create Rule**.
2. **Rule Name**: `Redirect WWW to Apex Domain`
3. **Expression**: `(http.host eq "www.digvijay.dev")`
4. **Target URL**: `https://digvijay.dev` (Dynamic / Preserve path: `concat("https://digvijay.dev", http.request.uri.path)`)
5. **Status Code**: `301 (Moved Permanently)`

---

## 3. GitHub Pages Settings

1. Ensure the `CNAME` file in the root of your repo contains:
   ```
   digvijay.dev
   ```
2. In GitHub Repository **Settings > Pages**:
   - **Custom domain**: `digvijay.dev`
   - **Enforce HTTPS**: Checked ✅

---

## 4. Decap CMS Setup (`/admin/`)

Your visual editor lives at `https://digvijay.dev/admin/`. Logging in triggers GitHub 2FA authentication through your Cloudflare Worker OAuth proxy script (`cloudflare-oauth-worker/`).
