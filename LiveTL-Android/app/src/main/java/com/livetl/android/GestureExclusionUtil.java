package com.livetl.android;

import android.graphics.Rect;
import android.os.Build;
import android.util.DisplayMetrics;

import androidx.appcompat.app.AppCompatActivity;

import java.util.ArrayList;
import java.util.List;

public class GestureExclusionUtil {
    private static final List<Rect> exclusionRects = new ArrayList<>();

    public static void updateGestureExclusion(AppCompatActivity activity) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return;

        exclusionRects.clear();
        int width = getScreenWidth(activity);
        int height = getScreenHeight(activity);
        exclusionRects.add(new Rect(0, 0, width, height));

        activity.findViewById(android.R.id.content).setSystemGestureExclusionRects(exclusionRects);
    }

    private static int getScreenHeight(AppCompatActivity activity) {
        DisplayMetrics displayMetrics = new DisplayMetrics();
        activity.getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
        return displayMetrics.heightPixels;
    }

    private static int getScreenWidth(AppCompatActivity activity) {
        DisplayMetrics displayMetrics = new DisplayMetrics();
        activity.getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
        return displayMetrics.widthPixels;
    }
}
