package com.lovedones.tracker;

import android.content.Context;
import android.content.Intent;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetPlugin")
public class WidgetPlugin extends Plugin {

    @PluginMethod
    public void syncWidgetData(PluginCall call) {
        String startDate = call.getString("startDate", "");
        String message = call.getString("message", "MY LOVE");

        Context context = getContext();
        Intent intent = new Intent("com.lovedones.tracker.UPDATE_WIDGET");
        intent.setPackage(context.getPackageName());
        intent.putExtra("start_date", startDate);
        intent.putExtra("partner_msg", message);
        context.sendBroadcast(intent);

        call.resolve();
    }
}
