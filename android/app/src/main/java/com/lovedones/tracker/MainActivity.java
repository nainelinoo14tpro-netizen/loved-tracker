package com.lovedones.tracker;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Native Widget Plugin နှင့် Voice Notification Plugin များကို စတင်မှတ်ပုံတင်ခြင်း
        registerPlugin(WidgetPlugin.class);
        registerPlugin(NotificationPlugin.class);

        super.onCreate(savedInstanceState);
    }
}
