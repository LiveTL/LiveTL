package com.livetl.android.webview;

import android.content.Intent;
import android.net.Uri;
import android.webkit.JavascriptInterface;
import android.widget.EditText;

import androidx.appcompat.app.AlertDialog;

import com.livetl.android.MainActivity;

public class LiveTLJSInterface {

    private final MainActivity activity;

    public LiveTLJSInterface(MainActivity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public void receiveMessage(String data) {
        activity.runOnUiThread(() -> {
            activity.getWebview().load(data, "", activity.getScreenDensity());
        });
    }

    @JavascriptInterface
    public void prompt(String text, String def) {
        AlertDialog.Builder alert = new AlertDialog.Builder(activity);
        alert.setTitle("LiveTL");
        alert.setMessage(text);

        EditText input = new EditText(activity);
        alert.setView(input);

        alert.setPositiveButton("OK", (dialog, whichButton) -> {
            String value = input.getText().toString();
            activity.runOnUiThread(() -> {
                activity.getWebview().runJS("window.promptCallback(\"" + Uri.encode(value) + "\")");
            });
        });

        alert.setNegativeButton("Cancel", (dialog, which) -> {
            activity.runOnUiThread(() -> activity.getWebview().runJS("window.promptCallback(\"\")"));
        });

        if (def != null) {
            input.setText(def);
        }

        alert.show();
    }

    @JavascriptInterface
    public void open(String url) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        activity.startActivity(intent);
    }

    @JavascriptInterface
    public void toggleFullScreen() {
        activity.runOnUiThread(activity::toggleFullscreen);
    }

    @JavascriptInterface
    public void getOrientation() {
        activity.runOnUiThread(() -> {
            activity.onConfigurationChanged(activity.getResources().getConfiguration());
        });
    }

    @JavascriptInterface
    public void startedLoading() {
        activity.runOnUiThread(activity::showWebview);
    }
}
