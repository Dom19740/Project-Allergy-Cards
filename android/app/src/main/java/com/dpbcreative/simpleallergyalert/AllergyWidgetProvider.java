package com.dpbcreative.simpleallergyalert;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.RemoteViews;

public class AllergyWidgetProvider extends AppWidgetProvider {
    public static final String ACTION_REFRESH = "com.dpbcreative.simpleallergyalert.ACTION_REFRESH";
    public static final String ACTION_OPEN_CARD = "com.dpbcreative.simpleallergyalert.ACTION_OPEN_CARD";
    public static final String EXTRA_CARD_ID = "card_id";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout);

        // Set up the StackView for horizontal cards
        Intent serviceIntent = new Intent(context, WidgetService.class);
        serviceIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        serviceIntent.setData(Uri.parse(serviceIntent.toUri(Intent.URI_INTENT_SCHEME)));
        views.setRemoteAdapter(R.id.card_stack, serviceIntent);
        views.setEmptyView(R.id.card_stack, R.id.empty_view);

        // Emergency Button Intent
        Intent emergencyIntent = new Intent(context, MainActivity.class);
        emergencyIntent.putExtra("route", "/emergency");
        PendingIntent emergencyPendingIntent = PendingIntent.getActivity(context, 0, emergencyIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.btn_emergency, emergencyPendingIntent);

        // Template for card clicks
        Intent clickIntent = new Intent(context, AllergyWidgetProvider.class);
        clickIntent.setAction(ACTION_OPEN_CARD);
        PendingIntent clickPendingIntent = PendingIntent.getBroadcast(context, 0, clickIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setPendingIntentTemplate(R.id.card_stack, clickPendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_REFRESH.equals(intent.getAction())) {
            AppWidgetManager mgr = AppWidgetManager.getInstance(context);
            int[] ids = mgr.getAppWidgetIds(new android.content.ComponentName(context, AllergyWidgetProvider.class));
            mgr.notifyAppWidgetViewDataChanged(ids, R.id.card_stack);
        } else if (ACTION_OPEN_CARD.equals(intent.getAction())) {
            String cardId = intent.getStringExtra(EXTRA_CARD_ID);
            Intent appIntent = new Intent(context, MainActivity.class);
            appIntent.putExtra(EXTRA_CARD_ID, cardId);
            appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(appIntent);
        }
    }
}