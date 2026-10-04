package com.lovedones.tracker;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NotificationPlugin")
public class NotificationPlugin extends Plugin {

    // ဖုန်းတစ်လုံးက Update လုပ်လိုက်တိုင်း အခြားဖုန်းတွင် ချက်ချင်း အသံနှင့် နိုတီကျစေမည့် စနစ်
    @PluginMethod
    public void showInstantNotification(PluginCall call) {
        String title = call.getString("title", "Loved Tracker");
        String message = call.getString("message", "အသစ်ရောက်ရှိပါသည်!");
        String category = call.getString("category", "couple");
        int notifId = (int) System.currentTimeMillis();

        Context context = getContext();
        Intent intent = new Intent(context, NotificationReceiver.class);
        intent.putExtra("title", title);
        intent.putExtra("message", message);
        intent.putExtra("category", category);
        intent.putExtra("notif_id", notifId);

        context.sendBroadcast(intent);
        call.resolve();
    }

    // သတ်မှတ်ချိန်မတိုင်မီ (၁ရက်၊ ၁၂နာရီ၊ ၁နာရီ၊ ၁မိနစ်အလို) Alarm ချိန်မှတ်ပေးသည့် စနစ်
    @PluginMethod
    public void scheduleAlarm(PluginCall call) {
        Long triggerAtMillis = call.getLong("triggerAtMillis");
        String title = call.getString("title", "Loved Tracker Reminder");
        String message = call.getString("message", "အချိန်ရောက်ရှိတော့မည် ဖြစ်ပါသည်!");
        String category = call.getString("category", "couple");
        Integer notifId = call.getInt("notifId", (int) System.currentTimeMillis());

        if (triggerAtMillis == null || triggerAtMillis <= System.currentTimeMillis()) {
            call.reject("Trigger time must be in the future");
            return;
        }

        Context context = getContext();
        Intent intent = new Intent(context, NotificationReceiver.class);
        intent.putExtra("title", title);
        intent.putExtra("message", message);
        intent.putExtra("category", category);
        intent.putExtra("notif_id", notifId);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                notifId,
                intent,
                flags
        );

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager != null) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            triggerAtMillis,
                            pendingIntent
                    );
                } else {
                    alarmManager.setExact(
                            AlarmManager.RTC_WAKEUP,
                            triggerAtMillis,
                            pendingIntent
                    );
                }
                JSObject ret = new JSObject();
                ret.put("status", "scheduled");
                ret.put("notifId", notifId);
                call.resolve(ret);
            } catch (SecurityException se) {
                alarmManager.set(
                        AlarmManager.RTC_WAKEUP,
                        triggerAtMillis,
                        pendingIntent
                );
                JSObject ret = new JSObject();
                ret.put("status", "fallback_scheduled");
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Failed to schedule alarm: " + e.getMessage());
            }
        } else {
            call.reject("AlarmManager not available");
        }
    }

    @PluginMethod
    public void cancelAlarm(PluginCall call) {
        Integer notifId = call.getInt("notifId");
        if (notifId == null) {
            call.reject("notifId required");
            return;
        }

        Context context = getContext();
        Intent intent = new Intent(context, NotificationReceiver.class);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                notifId,
                intent,
                flags
        );

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager != null) {
            alarmManager.cancel(pendingIntent);
        }
        call.resolve();
    }
}
