package com.dpbcreative.simpleallergyalert;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;

public class AllergyWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_OPEN_CARD = "com.dpbcreative.simpleallergyalert.ACTION_OPEN_CARD";
    public static final String ACTION_REFRESH = "com.dpbcreative.simpleallergyalert.ACTION_REFRESH";
    public static final String EXTRA_CARD_ID = "com.dpbcreative.simpleallergyalert.EXTRA_CARD_ID";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
        super.onUpdate(context, appWidgetManager, appWidgetIds);
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.allergy_widget);

        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        
        // Emergency button text
        try {
            String emergencyCardJson = prefs.getString("savedEmergencyCard", null);
            if (emergencyCardJson != null) {
                JSONObject obj = new JSONObject(emergencyCardJson);
                String langCode = obj.optString("languageCode", "").split("-")[0].toUpperCase();
                if (!langCode.isEmpty()) {
                    views.setTextViewText(R.id.emergency_text, "EMERGENCY (" + langCode + ")");
                }
            }
        } catch (Exception e) {}

        // Handle Dots
        try {
            String savedCardsJson = prefs.getString("savedAllergyCards", "[]");
            JSONArray array = new JSONArray(savedCardsJson);
            int count = array.length();
            int[] dotIds = {R.id.widget_dot_0, R.id.widget_dot_1, R.id.widget_dot_2};
            
            for (int i = 0; i < 3; i++) {
                if (i < count) {
                    views.setViewVisibility(dotIds[i], View.VISIBLE);
                    // Note: Real-time scroll tracking is not supported in standard Android widgets,
                    // so we show the dots as a count indicator.
                    views.setImageViewResource(dotIds[i], R.drawable.dot_inactive);
                } else {
                    views.setViewVisibility(dotIds[i], View.GONE);
                }
            }
        } catch (Exception e) {}

        // Emergency Intent
        Intent emergencyIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("simpleallergyalert://emergency"));
        PendingIntent emergencyPendingIntent = PendingIntent.getActivity(context, 0, emergencyIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.emergency_container, emergencyPendingIntent);

        // Adapter
        Intent serviceIntent = new Intent(context, WidgetService.class);
        serviceIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        serviceIntent.setData(Uri.parse(serviceIntent.toUri(Intent.URI_INTENT_SCHEME)));
        views.setRemoteAdapter(R.id.card_stack, serviceIntent);

        // Click Template
        Intent clickIntent = new Intent(context, AllergyWidgetProvider.class);
        clickIntent.setAction(ACTION_OPEN_CARD);
        views.setPendingIntentTemplate(R.id.card_stack, PendingIntent.getBroadcast(context, 0, clickIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE));

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        
        if (ACTION_OPEN_CARD.equals(intent.getAction())) {
            String cardId = intent.getStringExtra(EXTRA_CARD_ID);
            if (cardId != null) {
                Intent appIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("simpleallergyalert://card/" + cardId));
                appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(appIntent);
            }
        } else if (ACTION_REFRESH.equals(intent.getAction())) {
            ComponentName componentName = new ComponentName(context, AllergyWidgetProvider.class);
            int[] ids = appWidgetManager.getAppWidgetIds(componentName);
            appWidgetManager.notifyAppWidgetViewDataChanged(ids, R.id.card_stack);
            for (int id : ids) {
                updateAppWidget(context, appWidgetManager, id);
            }
        }
        super.onReceive(context, intent);
    }
}