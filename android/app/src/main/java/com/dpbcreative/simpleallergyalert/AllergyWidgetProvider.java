package com.dpbcreative.simpleallergyalert;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.RemoteViews;

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

        // Set up the intent for the Emergency button
        Intent emergencyIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("simpleallergyalert://emergency"));
        PendingIntent emergencyPendingIntent = PendingIntent.getActivity(context, 0, emergencyIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.emergency_container, emergencyPendingIntent);

        // Set up the intent for the Refresh button
        Intent refreshIntent = new Intent(context, AllergyWidgetProvider.class);
        refreshIntent.setAction(ACTION_REFRESH);
        refreshIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        PendingIntent refreshPendingIntent = PendingIntent.getBroadcast(context, appWidgetId, refreshIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.refresh_button, refreshPendingIntent);

        // Set up the intent for the footer (open app)
        Intent mainIntent = new Intent(context, MainActivity.class);
        PendingIntent mainPendingIntent = PendingIntent.getActivity(context, 0, mainIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.footer, mainPendingIntent);

        // Set up the collection (ListView)
        Intent serviceIntent = new Intent(context, WidgetService.class);
        serviceIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        serviceIntent.setData(Uri.parse(serviceIntent.toUri(Intent.URI_INTENT_SCHEME)));
        views.setRemoteAdapter(R.id.card_list, serviceIntent);
        views.setEmptyView(R.id.card_list, R.id.footer);

        // Set up the template for list item clicks
        Intent clickIntent = new Intent(context, AllergyWidgetProvider.class);
        clickIntent.setAction(ACTION_OPEN_CARD);
        PendingIntent clickPendingIntent = PendingIntent.getBroadcast(context, 0, clickIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE);
        views.setPendingIntentTemplate(R.id.card_list, clickPendingIntent);

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
            int appWidgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
            if (appWidgetId != AppWidgetManager.INVALID_APPWIDGET_ID) {
                // Notify the ListView to refresh its data
                appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.card_list);
            } else {
                // Refresh all widgets if ID is invalid
                ComponentName componentName = new ComponentName(context, AllergyWidgetProvider.class);
                int[] ids = appWidgetManager.getAppWidgetIds(componentName);
                appWidgetManager.notifyAppWidgetViewDataChanged(ids, R.id.card_list);
            }
        }
        super.onReceive(context, intent);
    }
}