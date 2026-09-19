/**
 * Clan Bank Manager (CBM) - Embeddable Product Widget
 * Pure JavaScript embed script for third-party websites.
 * 
 * Usage:
 *   <div id="cbm-product-widget"></div>
 *   <script src="https://cbm.wispbyte.org/widget.js" data-product-id="prod_xxx" data-target="#cbm-product-widget"></script>
 *
 * Or automatic injection:
 *   <script src="https://cbm.wispbyte.org/widget.js" data-product-id="prod_xxx"></script>
 */

(function () {
  'use strict';

  function getScriptOrigin() {
    try {
      var currentScript = document.currentScript;
      if (currentScript && currentScript.src) {
        var url = new URL(currentScript.src);
        return url.origin;
      }
    } catch (e) {}
    return window.location.origin;
  }

  var DEFAULT_ORIGIN = getScriptOrigin();

  function formatGold(num) {
    return Number(num || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function injectStyles() {
    if (document.getElementById('cbm-widget-css')) return;
    var style = document.createElement('style');
    style.id = 'cbm-widget-css';
    style.textContent = [
      '.cbm-card {',
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;',
      '  background: linear-gradient(145deg, #00172e 0%, #002244 100%);',
      '  border: 1px solid rgba(0, 112, 186, 0.35);',
      '  border-radius: 14px;',
      '  padding: 20px;',
      '  color: #f6f9fc;',
      '  width: 100%;',
      '  max-width: 340px;',
      '  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(0, 112, 186, 0.2);',
      '  box-sizing: border-box;',
      '  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;',
      '  position: relative;',
      '  overflow: hidden;',
      '}',
      '.cbm-card:hover {',
      '  transform: translateY(-2px);',
      '  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.55), 0 0 12px rgba(0, 112, 186, 0.35);',
      '  border-color: rgba(0, 112, 186, 0.6);',
      '}',
      '.cbm-thumb-wrap {',
      '  width: 100%;',
      '  height: 180px;',
      '  border-radius: 10px;',
      '  overflow: hidden;',
      '  background: #001224;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  margin-bottom: 14px;',
      '  position: relative;',
      '  border: 1px solid rgba(255, 255, 255, 0.05);',
      '}',
      '.cbm-thumb {',
      '  width: 100%;',
      '  height: 100%;',
      '  object-fit: cover;',
      '  display: block;',
      '}',
      '.cbm-thumb-placeholder {',
      '  font-size: 42px;',
      '  color: #0070ba;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  user-select: none;',
      '}',
      '.cbm-badge-strip {',
      '  position: absolute;',
      '  top: 10px;',
      '  right: 10px;',
      '  background: rgba(0, 23, 46, 0.85);',
      '  backdrop-filter: blur(6px);',
      '  border: 1px solid rgba(0, 207, 146, 0.4);',
      '  border-radius: 6px;',
      '  padding: 3px 8px;',
      '  font-size: 11px;',
      '  font-weight: 600;',
      '  color: #00cf92;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 4px;',
      '}',
      '.cbm-title {',
      '  font-size: 17px;',
      '  font-weight: 700;',
      '  color: #ffffff;',
      '  margin: 0 0 6px 0;',
      '  line-height: 1.3;',
      '  white-space: nowrap;',
      '  overflow: hidden;',
      '  text-overflow: ellipsis;',
      '}',
      '.cbm-desc {',
      '  font-size: 13px;',
      '  color: #a3b8cc;',
      '  margin: 0 0 14px 0;',
      '  line-height: 1.4;',
      '  display: -webkit-box;',
      '  -webkit-line-clamp: 2;',
      '  -webkit-box-orient: vertical;',
      '  overflow: hidden;',
      '  min-height: 36px;',
      '}',
      '.cbm-price-row {',
      '  display: flex;',
      '  align-items: baseline;',
      '  justify-content: space-between;',
      '  margin-bottom: 14px;',
      '  padding: 8px 10px;',
      '  background: rgba(0, 18, 36, 0.6);',
      '  border-radius: 8px;',
      '  border: 1px solid rgba(255, 255, 255, 0.05);',
      '}',
      '.cbm-price-label {',
      '  font-size: 11px;',
      '  font-weight: 600;',
      '  color: #8898aa;',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.5px;',
      '}',
      '.cbm-price-val {',
      '  font-size: 18px;',
      '  font-weight: 800;',
      '  color: #ffb800;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 4px;',
      '}',
      '.cbm-btn {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 8px;',
      '  width: 100%;',
      '  padding: 11px 16px;',
      '  background: linear-gradient(135deg, #0070ba 0%, #005a96 100%);',
      '  color: #ffffff;',
      '  border: none;',
      '  border-radius: 8px;',
      '  font-size: 14px;',
      '  font-weight: 700;',
      '  cursor: pointer;',
      '  text-decoration: none;',
      '  box-shadow: 0 4px 12px rgba(0, 112, 186, 0.35);',
      '  transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;',
      '  box-sizing: border-box;',
      '}',
      '.cbm-btn:hover {',
      '  background: linear-gradient(135deg, #0084dd 0%, #0066ab 100%);',
      '  transform: translateY(-1px);',
      '  box-shadow: 0 6px 16px rgba(0, 112, 186, 0.45);',
      '  color: #ffffff;',
      '  text-decoration: none;',
      '}',
      '.cbm-btn:active {',
      '  transform: translateY(0);',
      '  box-shadow: 0 2px 6px rgba(0, 112, 186, 0.3);',
      '}',
      '.cbm-footer {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 6px;',
      '  margin-top: 10px;',
      '  font-size: 11px;',
      '  color: #627b9b;',
      '}',
      '.cbm-footer a {',
      '  color: #8898aa;',
      '  text-decoration: none;',
      '  font-weight: 500;',
      '}',
      '.cbm-footer a:hover {',
      '  color: #00cf92;',
      '  text-decoration: underline;',
      '}',
      '.cbm-loading, .cbm-error {',
      '  padding: 24px;',
      '  text-align: center;',
      '  font-size: 13px;',
      '  color: #a3b8cc;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function renderWidget(container, productId, options) {
    options = options || {};
    var serverUrl = options.server || DEFAULT_ORIGIN;
    serverUrl = serverUrl.replace(/\/+$/, '');

    injectStyles();

    container.innerHTML = '<div class="cbm-card"><div class="cbm-loading">Loading product details...</div></div>';

    fetch(serverUrl + '/api/v1/products/' + encodeURIComponent(productId))
      .then(function (res) {
        if (!res.ok) {
          throw new Error('Product not found or unavailable (HTTP ' + res.status + ')');
        }
        return res.json();
      })
      .then(function (data) {
        var p = data.product || data;
        var checkoutUrl = serverUrl + '/product.html?id=' + encodeURIComponent(p.product_id || productId);
        var imageUrl = p.image_url;
        if (imageUrl && imageUrl.startsWith('/')) {
          imageUrl = serverUrl + imageUrl;
        }

        var imageHtml = imageUrl
          ? '<img src="' + escapeHtml(imageUrl) + '" alt="' + escapeHtml(p.name) + '" class="cbm-thumb" onerror="this.onerror=null;this.parentElement.innerHTML=\'<div class=\\\'cbm-thumb-placeholder\\\'>&#128230;</div>\';">'
          : '<div class="cbm-thumb-placeholder">&#128230;</div>';

        container.innerHTML = [
          '<div class="cbm-card">',
          '  <div class="cbm-thumb-wrap">',
          '    ' + imageHtml,
          '    <div class="cbm-badge-strip">',
          '      <span>&#10003; 50% Reserve Cushion</span>',
          '    </div>',
          '  </div>',
          '  <h3 class="cbm-title" title="' + escapeHtml(p.name) + '">' + escapeHtml(p.name) + '</h3>',
          '  <p class="cbm-desc" title="' + escapeHtml(p.description || '') + '">' + escapeHtml(p.description || 'Exclusive game item or service.') + '</p>',
          '  <div class="cbm-price-row">',
          '    <span class="cbm-price-label">Price</span>',
          '    <span class="cbm-price-val">',
          '      <span>' + formatGold(p.price_gold) + '</span>',
          '      <span style="font-size:12px;color:#f6f9fc;">GOLD</span>',
          '    </span>',
          '  </div>',
          '  <a href="' + escapeHtml(checkoutUrl) + '" target="_top" class="cbm-btn">',
          '    <span>Buy with CBM Gold</span>',
          '    <span style="font-size: 16px;">&rarr;</span>',
          '  </a>',
          '  <div class="cbm-footer">',
          '    <span>Secured by</span>',
          '    <a href="' + escapeHtml(serverUrl) + '/rulebook.html" target="_blank">Clan Bank Manager</a>',
          '  </div>',
          '</div>'
        ].join('\n');
      })
      .catch(function (err) {
        container.innerHTML = [
          '<div class="cbm-card">',
          '  <div class="cbm-error">',
          '    <div style="font-size:24px;margin-bottom:8px;">&#9888;</div>',
          '    <div>' + escapeHtml(err.message || 'Unable to load product') + '</div>',
          '  </div>',
          '</div>'
        ].join('\n');
      });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Global namespace for programmatic use
  window.CBMWidget = {
    render: renderWidget,
    init: function () {
      var scripts = document.getElementsByTagName('script');
      for (var i = 0; i < scripts.length; i++) {
        var s = scripts[i];
        var pid = s.getAttribute('data-product-id');
        if (pid && !s.getAttribute('data-cbm-loaded')) {
          s.setAttribute('data-cbm-loaded', 'true');
          var targetSel = s.getAttribute('data-target');
          var targetEl = targetSel ? document.querySelector(targetSel) : null;
          if (!targetEl) {
            targetEl = document.createElement('div');
            targetEl.className = 'cbm-widget-container';
            s.parentNode.insertBefore(targetEl, s.nextSibling);
          }
          var server = s.getAttribute('data-server') || DEFAULT_ORIGIN;
          renderWidget(targetEl, pid, { server: server });
        }
      }

      // Also support standalone div tags with data-cbm-product
      var els = document.querySelectorAll('[data-cbm-product]');
      for (var j = 0; j < els.length; j++) {
        var el = els[j];
        if (!el.getAttribute('data-cbm-loaded')) {
          el.setAttribute('data-cbm-loaded', 'true');
          var prodId = el.getAttribute('data-cbm-product');
          var srv = el.getAttribute('data-server') || DEFAULT_ORIGIN;
          renderWidget(el, prodId, { server: srv });
        }
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.CBMWidget.init);
  } else {
    window.CBMWidget.init();
  }
})();
