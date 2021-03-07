package com.livetl.android;

import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.os.Bundle;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;

import com.livetl.android.databinding.ActivityMainBinding;
import com.livetl.android.webview.LiveTLJSInterface;
import com.livetl.android.webview.LiveTLWebView;

public class MainActivity extends AppCompatActivity {

    private static final int UI_FLAGS = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;

    private ActivityMainBinding binding;
    private int screenDensity = 0;

    private LiveTLWebView webview;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        screenDensity = getResources().getDisplayMetrics().densityDpi;

        LiveTLJSInterface jsInterface = new LiveTLJSInterface(this);
        webview = new LiveTLWebView(this, binding.webview, jsInterface);

        onNewIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        String action = intent.getAction();
        String type = intent.getType();

        if (Intent.ACTION_VIEW.equals(action)) {
            handleVideoIntent(intent.getDataString());
        } else if (Intent.ACTION_SEND.equals(action) && "text/plain".equals(type)) {
            handleVideoIntent(intent.getStringExtra(Intent.EXTRA_TEXT));
        } else {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_USER);
            webview.load("https://livetl.github.io/LiveTL/about/android", "frame", (screenDensity * 3) / 4);
        }

        updateUI();
    }

    private void handleVideoIntent(String url) {
        String[] split = url.split("/");
        String video = split[split.length - 1];
        webview.load("https://www.youtube.com/404.html?v=" + video, "loader", screenDensity);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_USER);
        binding.webview.setVisibility(View.GONE);
    }

    void updateUI() {
        View v = getWindow().getDecorView();
        v.setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
    }

    @Override
    protected void onPause() {
        super.onPause();
        binding.webview.onPause();
    }

    @Override
    public void onResume() {
        super.onResume();
        binding.webview.onResume();
        updateUI();
    }

    @Override
    public void onBackPressed() {
        /* no-op */
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        runOnUiThread(() -> {
            webview.runJS("onAndroidOrientationChange('" + getOrientation(newConfig) + "')");
        });
    }

    public int getScreenDensity() {
        return screenDensity;
    }

    public LiveTLWebView getWebview() {
        return webview;
    }

    public void showWebview() {
        binding.webview.setVisibility(View.VISIBLE);
    }

    public void toggleFullscreen() {
        View view = binding.getRoot();
        if (view.getSystemUiVisibility() == View.SYSTEM_UI_FLAG_VISIBLE) {
            view.setSystemUiVisibility(UI_FLAGS);
        } else {
            view.setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
        }
    }

    private String getOrientation(Configuration newConfig) {
        if (newConfig.orientation == Configuration.ORIENTATION_LANDSCAPE) {
            return "landscape";
        }
        return "portrait";
    }
}
