package com.lovedones.tracker;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class LovedWidgetProvider extends AppWidgetProvider {

    public static final String PREFS_NAME = "LovedTrackerPrefs";
    public static final String KEY_START_DATE = "loved_start_date";
    public static final String KEY_MESSAGE = "loved_partner_msg";

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);

        // App ထဲမှ Broadcast ပို့လိုက်ပါက ချက်ချင်း လက်ခံ Update လုပ်ခြင်း
        if ("com.lovedones.tracker.UPDATE_WIDGET".equals(intent.getAction())) {
            if (intent.hasExtra("start_date")) {
                String d = intent.getStringExtra("start_date");
                context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                        .edit().putString(KEY_START_DATE, d).apply();
            }
            if (intent.hasExtra("partner_msg")) {
                String m = intent.getStringExtra("partner_msg");
                context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                        .edit().putString(KEY_MESSAGE, m).apply();
            }
            updateAllWidgets(context);
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String startDateStr = prefs.getString(KEY_START_DATE, "");
        String partnerMsg = prefs.getString(KEY_MESSAGE, "MY LOVE");

        // ရက်ပေါင်း Real-time တိကျစွာ တွက်ချက်ခြင်း
        long daysDiff = 0;
        if (startDateStr != null && !startDateStr.isEmpty()) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
                Date startDate = sdf.parse(startDateStr);
                if (startDate != null) {
                    long diffInMillis = System.currentTimeMillis() - startDate.getTime();
                    if (diffInMillis > 0) {
                        daysDiff = diffInMillis / (1000 * 60 * 60 * 24);
                    }
                }
            } catch (Exception ignored) {}
        }

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_loved_tracker);
        views.setTextViewText(R.id.widget_days, daysDiff + " ရက်မြောက်");
        views.setTextViewText(R.id.widget_message, "💌 " + partnerMsg);

        // Widget နှိပ်ပါက App တိုက်ရိုက်ပွင့်ရန်
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, LovedWidgetProvider.class));
        for (int id : ids) {
            updateAppWidget(context, manager, id);
        }
    }
}
