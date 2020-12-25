package com.android.livetl;

import android.content.Context;
import android.graphics.Rect;
import android.os.Build;
import android.util.DisplayMetrics;

import androidx.appcompat.app.AppCompatActivity;

import java.util.ArrayList;
import java.util.List;

public class Utils {
    static List<Rect> exclusionRects = new ArrayList<>();
    public static void updateGestureExclusion(AppCompatActivity activity) {
        if (Build.VERSION.SDK_INT < 29) return;
        exclusionRects.clear();
        int width = getScreenWidth(activity) + 1;
        int height = getScreenHeight(activity) + 1;
        exclusionRects.add(new Rect(0, 0, width, height));

        activity.findViewById(android.R.id.content).setSystemGestureExclusionRects(exclusionRects);
    }

    public static int getScreenHeight(AppCompatActivity activity) {
        DisplayMetrics displayMetrics = new DisplayMetrics();
        activity.getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
        int height = displayMetrics.heightPixels;
        return height;
    }

    public static int getScreenWidth(AppCompatActivity activity) {
        DisplayMetrics displayMetrics = new DisplayMetrics();
        activity.getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
        int width = displayMetrics.widthPixels;
        return width;
    }
}
