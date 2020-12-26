package com.android.livetl;

import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;

import android.annotation.SuppressLint;
import android.content.pm.ActivityInfo;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewTreeObserver;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends AppCompatActivity {
    int flags = View.SYSTEM_UI_FLAG_FULLSCREEN;

    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_USER_LANDSCAPE);
        getWindow().getDecorView().setSystemUiVisibility(flags);
        loadWebview();
    }

    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
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
        s.setUserAgentString(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/89.0.4346.0 Safari/537.36 Edg/89.0.731.0"
        );
        wv.setScrollBarStyle(WebView.SCROLLBARS_INSIDE_INSET);
        wv.setScrollbarFadingEnabled(false);
        wv.setWebContentsDebuggingEnabled(true);
        wv.setInitialScale(getResources().getDisplayMetrics().densityDpi);
//        View root = wv.getRootView();
//        ViewTreeObserver treeObserver = root.getViewTreeObserver();
//        treeObserver.addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
//            @Override
//            public void onGlobalLayout() {
//                root.getRootView().getViewTreeObserver().removeOnGlobalLayoutListener(this);
//                Utils.updateGestureExclusion(MainActivity.this);
//            }
//        });
    }

    @SuppressLint("NewApi")
    @Override
    public void onWindowFocusChanged(boolean hasFocus)
    {
        super.onWindowFocusChanged(hasFocus);
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT && hasFocus)
        {
            getWindow().getDecorView().setSystemUiVisibility(flags);
        }
    }
}