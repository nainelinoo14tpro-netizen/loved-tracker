package com.lovedones.tracker;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import androidx.core.app.NotificationCompat;

import java.util.Locale;

public class NotificationReceiver extends BroadcastReceiver {

    public static final String CHANNEL_ID = "loved_tracker_alarm_channel";
    public static final String CHANNEL_NAME = "Loved Tracker Reminders";

    @Override
    public void onReceive(Context context, Intent intent) {
        String title = intent.getStringExtra("title");
        String message = intent.getStringExtra("message");
        String category = intent.getStringExtra("category"); // couple, family, friends
        int notifId = intent.getIntExtra("notif_id", (int) System.currentTimeMillis());

        if (title == null || title.isEmpty()) {
            title = "Loved Tracker Reminder";
        }
        if (message == null || message.isEmpty()) {
            message = "အချိန်ရောက်ရှိတော့မည် ဖြစ်ပါသည်!";
        }

        // ၁။ Notification Channel တည်ဆောက်ခြင်း
        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Note time reminder notifications");
            channel.enableLights(true);
            channel.setLightColor(Color.parseColor("#ff4b8b"));
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0, 250, 150, 250});
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }

        // ၂။ Notification နှိပ်လျှင် App ပွင့်စေမည့် PendingIntent
        Intent openAppIntent = new Intent(context, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                notifId,
                openAppIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // ၃။ Notification Build ပြုလုပ်ပြီး ဖုန်းမျက်နှာပြင်ပေါ် တင်ပေးခြင်း
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(message)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(message))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setVibrate(new long[]{0, 250, 150, 250})
                .setContentIntent(pendingIntent);

        if (notificationManager != null) {
            notificationManager.notify(notifId, builder.build());
        }

        // ၄။ သက်ဆိုင်ရာ Category အလိုက် AI Voice စကားသံ သတ်မှတ်ခြင်း
        String voiceText = "I love you and miss you babe";
        if ("family".equalsIgnoreCase(category)) {
            voiceText = "Hello guys";
        } else if ("friends".equalsIgnoreCase(category)) {
            voiceText = "Hello my friends";
        }

        final String speechPhrase = voiceText;
        final PendingResult pendingResult = goAsync();

        // ၅။ Text-To-Speech (AI Voice) ဖြင့် အင်္ဂလိပ်အသံထွက် ဖွင့်ပြခြင်း
        new Handler(Looper.getMainLooper()).post(() -> {
            final TextToSpeech[] ttsEngine = new TextToSpeech[1];
            
            // Timeout safety (၈ စက္ကန့်အတွင်း အလိုအလျောက် ပိတ်သိမ်းခြင်း)
            new Handler(Looper.getMainLooper()).postDelayed(() -> {
                try {
                    if (ttsEngine[0] != null) {
                        ttsEngine[0].stop();
                        ttsEngine[0].shutdown();
                    }
                    pendingResult.finish();
                } catch (Exception ignored) {}
            }, 8000);

            ttsEngine[0] = new TextToSpeech(context.getApplicationContext(), status -> {
                if (status == TextToSpeech.SUCCESS) {
                    ttsEngine[0].setLanguage(Locale.US);
                    ttsEngine[0].setPitch(1.08f); // Sweet tone
                    ttsEngine[0].setSpeechRate(0.92f); // Clear pace

                    ttsEngine[0].setOnUtteranceProgressListener(new UtteranceProgressListener() {
                        @Override
                        public void onStart(String utteranceId) {}

                        @Override
                        public void onDone(String utteranceId) {
                            try {
                                if (ttsEngine[0] != null) {
                                    ttsEngine[0].stop();
                                    ttsEngine[0].shutdown();
                                }
                                pendingResult.finish();
                            } catch (Exception ignored) {}
                        }

                        @Override
                        public void onError(String utteranceId) {
                            try {
                                if (ttsEngine[0] != null) {
                                    ttsEngine[0].shutdown();
                                }
                                pendingResult.finish();
                            } catch (Exception ignored) {}
                        }
                    });

                    ttsEngine[0].speak(
                            speechPhrase,
                            TextToSpeech.QUEUE_FLUSH,
                            null,
                            "LovedAlarmUtterance_" + System.currentTimeMillis()
                    );
                } else {
                    pendingResult.finish();
                }
            });
        });
    }
}
