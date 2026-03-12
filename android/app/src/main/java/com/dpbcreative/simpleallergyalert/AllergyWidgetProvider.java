package com.dpbcreative.simpleallergyalert;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

public class AllergyWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_OPEN_CARD = "com.dpbcreative.simpleallergyalert.ACTION_OPEN_CARD";
    public static final String ACTION_REFRESH = "com.dpbcreative.simpleallergyalert.ACTION_REFRESH";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.allergy_widget);

        // Emergency button
        Intent emergencyIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("simpleallergyalert://emergency"));
        PendingIntent emergencyPendingIntent = PendingIntent.getActivity(context, 0, emergencyIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.emergency_container, emergencyPendingIntent);

        // Footer (open app)
        Intent mainIntent = new Intent(context, MainActivity.class);
        PendingIntent mainPendingIntent = PendingIntent.getActivity(context, 0, mainIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.footer, mainPendingIntent);

        // Clear existing cards and load new ones
        views.removeAllViews(R.id.cards_container);
        
        try {
            SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String savedCardsJson = prefs.getString("savedAllergyCards", null);
            
            if (savedCardsJson != null) {
                JSONArray jsonArray = new JSONArray(savedCardsJson);
                for (int i = 0; i < Math.min(jsonArray.length(), 3); i++) {
                    JSONObject obj = jsonArray.getJSONObject(i);
                    String id = obj.getString("id");
                    String name = obj.getString("name");
                    String lang = obj.getString("languageCode");

                    RemoteViews cardView = new RemoteViews(context.getPackageName(), R.layout.widget_item);
                    cardView.setTextViewText(R.id.card_name, name);
                    cardView.setTextViewText(R.id.lang_code, lang.toUpperCase());

                    // Set click intent for the card
                    Intent cardIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("simpleallergyalert://card/" + id));
                    PendingIntent cardPendingIntent = PendingIntent.getActivity(context, i + 1, cardIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                    cardView.setOnClickPendingIntent(R.id.widget_item_container, cardPendingIntent);

                    views.addView(R.id.cards_container, cardView);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (ACTION_REFRESH.equals(intent.getAction())) {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName componentName = new ComponentName(context, AllergyWidgetProvider.class);
            int[] ids = appWidgetManager.getAppWidgetIds(componentName);
            for (int id : ids) {
                updateAppWidget(context, appWidgetManager, id);
            }
        }
        super.onReceive(context, intent);
    }
}