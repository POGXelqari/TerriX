package org.wispbyte.cbm;

import android.annotation.SuppressLint;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

import java.util.HashMap;
import java.util.Map;

public class MainActivity extends AppCompatActivity {

    private WebView mWebView;
    private static final String TARGET_URL = "https://cbm.wispbyte.org/cbm.html";

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mWebView = new WebView(this);
        mWebView.setBackgroundColor(Color.parseColor("#080d16"));
        setContentView(mWebView);

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);

        // Append Official Native App User-Agent signature
        String defaultUA = settings.getUserAgentString();
        settings.setUserAgentString(defaultUA + " ClanBankManager/1.0.0 (Android; org.wispbyte.cbm)");

        // Enable persistent cookies
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(mWebView, true);

        // Custom WebViewClient with App Origin header injection
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.contains("wispbyte.org")) {
                    return false;
                }
                return false;
            }
        });

        // Load Portal with App Origin headers
        Map<String, String> headers = new HashMap<>();
        headers.put("X-CBM-App-Origin", "org.wispbyte.cbm.android");
        headers.put("X-CBM-Native-Client", "official-android");
        mWebView.loadUrl(TARGET_URL, headers);
    }

    @Override
    public void onBackPressed() {
        if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
