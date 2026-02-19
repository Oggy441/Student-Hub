package com.oggy441.studenthub;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class ScheduleWidgetProvider extends AppWidgetProvider {

    private static final String PREFS_NAME = "CapacitorStorage";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String scheduleJson = prefs.getString("today_schedule", "[]");
        String groupName = prefs.getString("current_group", "G-1");
        
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_schedule);
        
        // Update Group
        views.setTextViewText(R.id.widget_group, groupName);

        try {
            JSONArray schedule = new JSONArray(scheduleJson);
            
            if (schedule.length() == 0) {
                views.setViewVisibility(R.id.no_classes_view, View.VISIBLE);
                views.setViewVisibility(R.id.item_1, View.GONE);
                views.setViewVisibility(R.id.item_2, View.GONE);
                views.setViewVisibility(R.id.item_3, View.GONE);
            } else {
                views.setViewVisibility(R.id.no_classes_view, View.GONE);
                
                // Card 1
                updateItem(views, schedule, 0, R.id.item_1, R.id.subject_1, R.id.time_1, R.id.accent_1);
                
                // Card 2
                if (schedule.length() > 1) {
                    updateItem(views, schedule, 1, R.id.item_2, R.id.subject_2, R.id.time_2, R.id.accent_2);
                } else {
                    views.setViewVisibility(R.id.item_2, View.GONE);
                }

                // Card 3
                if (schedule.length() > 2) {
                    updateItem(views, schedule, 2, R.id.item_3, R.id.subject_3, R.id.time_3, R.id.accent_3);
                } else {
                    views.setViewVisibility(R.id.item_3, View.GONE);
                }
            }
        } catch (Exception e) {
            views.setViewVisibility(R.id.no_classes_view, View.VISIBLE);
            views.setTextViewText(R.id.no_classes_view, "Error loading schedule");
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static void updateItem(RemoteViews views, JSONArray schedule, int index, int layoutId, int subjectId, int timeId, int accentId) {
        try {
            JSONObject item = schedule.getJSONObject(index);
            views.setViewVisibility(layoutId, View.VISIBLE);
            views.setTextViewText(subjectId, item.getString("subject"));
            views.setTextViewText(timeId, "Today, " + item.getString("time"));
            
            if (item.has("color")) {
                try {
                    int color = Color.parseColor(item.getString("color"));
                    views.setInt(accentId, "setBackgroundColor", color);
                } catch (Exception e) {
                    // Fallback color
                }
            }
        } catch (Exception e) {
            views.setViewVisibility(layoutId, View.GONE);
        }
    }
}
