package com.livetl.android.webview;

import android.app.Activity;
import android.content.pm.ApplicationInfo;
import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.ViewTreeObserver;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.annotation.RequiresApi;

import com.livetl.android.BuildConfig;
import com.livetl.android.GestureExclusionUtil;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class LiveTLWebView {

    private static final String USER_AGENT = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                    "(KHTML, like Gecko) Chrome/89.0.4346.0 Safari/537.36 Edg/89.0.731.0"
    );

    private final Activity activity;
    private final WebView webview;
    private final LiveTLJSInterface jsInterface;

    public LiveTLWebView(Activity activity, WebView webview, LiveTLJSInterface jsInterface) {
        this.activity = activity;
        this.webview = webview;
        this.jsInterface = jsInterface;

        // Debug mode (chrome://inspect/#devices)
        if (BuildConfig.DEBUG && (activity.getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
    }

    public void runJS(String js) {
        webview.loadUrl("javascript:" + js);
    }

    public void load(String url, String inject, int density) {
        webview.setWebViewClient(new WebViewClient() {
            public void onPageFinished(WebView view, String url) {
                if (inject.equals("frame") || inject.equals("loader")) {
                    view.loadUrl("javascript:" +
                            "window.history.pushState('', '', '" + url + "');" +
                            "myScript = document.createElement('script');" +
                            "myScript.src = 'CUSTOMJS/js/frame.js';" +
                            "document.body.appendChild(myScript);");
                }
            }

            @RequiresApi(api = Build.VERSION_CODES.N)
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (inject.equals("loader")) {
                    try {
                        String jsURL = "javascript:" + readFile("inject.js").replaceAll(
                                "\n", ""
                        );
                        activity.runOnUiThread(() -> {
                            view.loadUrl(jsURL);
                        });
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
                String INJECTION_TOKEN = "CUSTOMJS/";
                WebResourceResponse response = null;
                if (url.contains(INJECTION_TOKEN)) {
                    String assetPath = url.substring(url.indexOf(INJECTION_TOKEN) +
                            INJECTION_TOKEN.length());
                    String[] spliced = assetPath.split(".");
                    try {
                        response = new WebResourceResponse(
                                (spliced.length > 0 && spliced[spliced.length - 1].equals("js") ?
                                    "application/javascript" : ""),
                                "UTF8",
                                activity.getAssets().open(assetPath)
                        );
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                } else if (url.startsWith("https://www.youtube.com/live_chat") ||
                        url.startsWith("https://www.youtube.com/embed")) {
                    try {
                        WebResourceResponse cordovaResponse =
                                super.shouldInterceptRequest(view, request);
                        if (cordovaResponse != null) {
                            return cordovaResponse;
                        }
                        OkHttpClient httpClient = new OkHttpClient();
                        Request okRequest = new Request.Builder()
                                .header("User-Agent", USER_AGENT)
                                .url(url)
                                .build();
                        Response modifiedResponse = httpClient.newCall(okRequest)
                                .execute().newBuilder()
                                .removeHeader("x-frame-options")
                                .removeHeader("frame-options")
                                .build();
                        String s = url.startsWith("https://www.youtube.com/embed") ?
                                "<script src=\"CUSTOMJS/js/frame.js\"></script>" : "";
                        return new WebResourceResponse("text/html",
                                modifiedResponse.header("content-encoding", "utf-8"),
                                new ByteArrayInputStream(
                                        (modifiedResponse.body().string() + s)
                                                .getBytes(StandardCharsets.UTF_8))
                        );

                    } catch (MalformedURLException e) {
                        e.printStackTrace();
                        return null;
                    } catch (IOException e) {
                        e.printStackTrace();
                        return null;
                    }
                } else {
                    response = super.shouldInterceptRequest(view, url);
                }
                return response;
            }
        });
        webview.setBackgroundColor(Color.BLACK);
        webview.loadUrl(url);
        webview.setInitialScale(density);
        WebSettings s = webview.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setPluginState(WebSettings.PluginState.ON);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setUserAgentString(USER_AGENT);
        s.setSupportMultipleWindows(true);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        webview.setScrollBarStyle(WebView.SCROLLBARS_INSIDE_INSET);
        webview.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webview.setScrollbarFadingEnabled(false);
        WebView.setWebContentsDebuggingEnabled(true);
        webview.addJavascriptInterface(jsInterface, "Android");
        View root = webview.getRootView();
        ViewTreeObserver treeObserver = root.getViewTreeObserver();
        treeObserver.addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
            @Override
            public void onGlobalLayout() {
                root.getRootView().getViewTreeObserver().removeOnGlobalLayoutListener(this);
                GestureExclusionUtil.updateGestureExclusion(activity);
            }
        });
        GestureExclusionUtil.updateGestureExclusion(activity);
    }

    private String readFile(String filePath) throws IOException {
        BufferedReader r = new BufferedReader(new InputStreamReader(activity.getAssets().open(filePath)));
        StringBuilder total = new StringBuilder();
        for (String line; (line = r.readLine()) != null; ) {
            total.append(line).append('\n');
        }
        return total.toString();
    }
}
