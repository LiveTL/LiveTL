package com.android.livetl;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        this.loadWebview();
    }

    void loadWebview(){
        WebView wv = (WebView) findViewById(R.id.mainWebview);
        wv.setWebViewClient(new WebViewClient());
        wv.loadUrl("file:///android_asset/index.html");
        WebSettings s = wv.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setJavaScriptEnabled(true);
        s.setPluginState(WebSettings.PluginState.ON);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        wv.setScrollBarStyle(WebView.SCROLLBARS_INSIDE_INSET);
        wv.setScrollbarFadingEnabled(false);
        wv.setWebContentsDebuggingEnabled(true);
    }
}