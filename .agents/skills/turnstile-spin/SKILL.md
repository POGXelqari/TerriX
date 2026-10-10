---
name: turnstile-spin
description: Set up Cloudflare Turnstile end-to-end in a project. Scan the codebase, configure the widget, embed it where user requests need bot verification (form submissions, SPA actions, API endpoints, download links, comment or vote submissions), wire canonical server-side siteverify in the customer's existing backend, and validate.
---

# Cloudflare Turnstile Integration Skill

This skill documents the canonical Cloudflare Turnstile bot verification architecture, frontend embedding, and server-side `siteverify` patterns for Clan Bank Manager (CBM).

## 1. Credentials & Environment
- **Site Key**: `0x4AAAAAAFTHDMRiQrSwWPa0`
- **Secret Key**: Stored exclusively in git-ignored `.env` as `TURNSTILE_SECRET`
- **Allowed Hostnames**: `TURNSTILE_HOSTNAMES=cbm.wispbyte.org,78.154.103.45,localhost,127.0.0.1`

## 2. Frontend Widget Embedding
Turnstile uses explicit or auto-rendered widgets with single-use token lifecycle.

```html
<!-- Load API Script in <head> -->
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

<!-- Embed Widget in <form> -->
<div class="turnstile-wrap">
  <div id="turnstileWidget" class="cf-turnstile" data-sitekey="0x4AAAAAAFTHDMRiQrSwWPa0" data-action="register" data-theme="dark"></div>
</div>
```

### Single-Use Token Lifecycle:
```javascript
// 1. Read token
const turnstileToken = (window.turnstile ? window.turnstile.getResponse() : '') || (document.querySelector('[name="cf-turnstile-response"]')?.value || '');
if (!turnstileToken) {
  showAlert('Please complete the Cloudflare security verification challenge.');
  return;
}
payload["cf-turnstile-response"] = turnstileToken;

// 2. Reset token on submission error or retry
if (window.turnstile) {
  try { window.turnstile.reset(); } catch (_) {}
}
```

## 3. Server-Side Siteverify
Send POST to `https://challenges.cloudflare.com/turnstile/v0/siteverify`:
- Parameter `secret`: `TURNSTILE_SECRET`
- Parameter `response`: `cf-turnstile-response` token from client
- Parameter `remoteip`: Client IP address

Enforce:
- `success === True`
- `action === expected_action`
- `hostname` in `TURNSTILE_HOSTNAMES`

Native client applications (`org.wispbyte.cbm.desktop`, `org.wispbyte.cbm.android`) bypass interactive Turnstile challenges on internal API endpoints.

## 4. Content Security Policy (CSP) Requirements
When Turnstile is active, CSP must permit:
- `script-src`: `https://challenges.cloudflare.com`
- `frame-src`: `https://challenges.cloudflare.com`
- `connect-src`: `https://challenges.cloudflare.com`
