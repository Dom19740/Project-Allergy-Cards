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

        // Check Premium Status
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String isPremiumStr = prefs.getString("isPremium", "false");
        boolean isPremium = "true".equals(isPremiumStr);

        if (isPremium) {
            views.setViewVisibility(R.id.active_container, View.VISIBLE);
            views.setViewVisibility(R.id.locked_container, View.GONE);

            // Standard App Launch Intent
            Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
            if (launchIntent != null) {
                launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
                PendingIntent launchPendingIntent = PendingIntent.getActivity(context, 1, launchIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                views.setOnClickPendingIntent(R.id.app_icon_launcher, launchPendingIntent);
            }

            // Emergency button text
            try {
                String emergencyCardJson = prefs.getString("savedEmergencyCard", null);
                if (emergencyCardJson != null) {
                    JSONObject obj = new JSONObject(emergencyCardJson);
                    String langCode = obj.optString("languageCode", "").split("-")[0].toUpperCase();
                    if (!langCode.isEmpty()) {
                        views.setTextViewText(R.id.emergency_text, "EMERGENCY (" + langCode + ")");
                    }
                } else {
                    views.setTextViewText(R.id.emergency_text, "EMERGENCY");
                }
            } catch (Exception e) {
                views.setTextViewText(R.id.emergency_text, "EMERGENCY");
            }

            // Emergency Intent
            String emergencyUri = "simpleallergyalert://emergency?t=" + System.currentTimeMillis();
            Intent emergencyIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(emergencyUri));
            emergencyIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            PendingIntent emergencyPendingIntent = PendingIntent.getActivity(context, 0, emergencyIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.emergency_container, emergencyPendingIntent);

            // Adapter
            Intent serviceIntent = new Intent(context, WidgetService.class);
            serviceIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
            serviceIntent.setData(Uri.parse(serviceIntent.toUri(Intent.URI_INTENT_SCHEME)));
            views.setRemoteAdapter(R.id.card_stack, serviceIntent);

            // Click Template for individual cards
            Intent clickIntent = new Intent(context, AllergyWidgetProvider.class);
            clickIntent.setAction(ACTION_OPEN_CARD);
            views.setPendingIntentTemplate(R.id.card_stack, PendingIntent.getBroadcast(context, 0, clickIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE));
        } else {
            views.setViewVisibility(R.id.active_container, View.GONE);
            views.setViewVisibility(R.id.locked_container, View.VISIBLE);

            // Unlock Intent - Deep link to premium page
            String premiumUri = "simpleallergyalert://premium";
            Intent premiumIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(premiumUri));
            premiumIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            PendingIntent premiumPendingIntent = PendingIntent.getActivity(context, 2, premiumIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.unlock_button, premiumPendingIntent);
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        
        if (ACTION_OPEN_CARD.equals(intent.getAction())) {
            String cardId = intent.getStringExtra(EXTRA_CARD_ID);
            if (cardId != null) {
                String uriString = "simpleallergyalert://card/" + cardId;
                
                Intent appIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
                if (appIntent != null) {
                    appIntent.setData(Uri.parse(uriString));
                    appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    context.startActivity(appIntent);
                }
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