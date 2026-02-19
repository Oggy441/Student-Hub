package com.oggy441.studenthub;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@CapacitorPlugin(name = "WidgetSync")
public class WidgetSyncPlugin extends Plugin {

    private static final String PREFS_NAME = "CapacitorStorage";

    @PluginMethod
    public void syncSchedule(PluginCall call) {
        String scheduleJson = call.getString("schedule");
        String group = call.getString("group");
        if (scheduleJson == null) {
            call.reject("Schedule data is required");
            return;
        }

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("today_schedule", scheduleJson);
        if (group != null) {
            editor.putString("current_group", group);
        }
        editor.apply();

        // Trigger widget update
        Intent intent = new Intent(context, ScheduleWidgetProvider.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] ids = AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, ScheduleWidgetProvider.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);

        call.resolve();
    }
}
