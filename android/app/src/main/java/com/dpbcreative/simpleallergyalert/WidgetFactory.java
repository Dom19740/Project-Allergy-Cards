package com.dpbcreative.simpleallergyalert;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class WidgetFactory implements RemoteViewsService.RemoteViewsFactory {

    private Context context;
    private List<CardItem> cardItems = new ArrayList<>();

    public WidgetFactory(Context context, Intent intent) {
        this.context = context;
    }

    @Override
    public void onCreate() {
        loadData();
    }

    @Override
    public void onDataSetChanged() {
        loadData();
    }

    private void loadData() {
        cardItems.clear();
        try {
            SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            
            // Load Emergency Card first
            String emergencyCardJson = prefs.getString("savedEmergencyCard", null);
            if (emergencyCardJson != null) {
                JSONObject obj = new JSONObject(emergencyCardJson);
                cardItems.add(new CardItem(
                        obj.optString("id", "emergency-slot"),
                        obj.optString("name", "Emergency Card"),
                        obj.optString("languageCode", "EN"),
                        true
                ));
            }

            // Load Standard Cards
            String savedCardsJson = prefs.getString("savedAllergyCards", null);
            if (savedCardsJson != null) {
                JSONArray jsonArray = new JSONArray(savedCardsJson);
                for (int i = 0; i < Math.min(jsonArray.length(), 3); i++) {
                    JSONObject obj = jsonArray.getJSONObject(i);
                    cardItems.add(new CardItem(
                            obj.optString("id", ""),
                            obj.optString("name", "Allergy Card"),
                            obj.optString("languageCode", "EN"),
                            false
                    ));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onDestroy() {
        cardItems.clear();
    }

    @Override
    public int getCount() {
        return cardItems.size();
    }

    @Override
    public RemoteViews getViewAt(int position) {
        if (position >= cardItems.size()) return null;

        CardItem item = cardItems.get(position);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_card_item);
        
        String displayName = item.isEmergency ? "⚠️ " + item.name : item.name;
        views.setTextViewText(R.id.card_name, displayName);
        views.setTextViewText(R.id.card_lang, item.langCode.toUpperCase());

        Bundle extras = new Bundle();
        extras.putString(AllergyWidgetProvider.EXTRA_CARD_ID, item.id);
        extras.putBoolean("isEmergency", item.isEmergency);
        
        Intent fillInIntent = new Intent();
        fillInIntent.putExtras(extras);
        views.setOnClickFillInIntent(R.id.card_container, fillInIntent);

        return views;
    }

    @Override
    public RemoteViews getLoadingView() { return null; }

    @Override
    public int getViewTypeCount() { return 1; }

    @Override
    public long getItemId(int position) { return position; }

    @Override
    public boolean hasStableIds() { return true; }

    private static class CardItem {
        String id;
        String name;
        String langCode;
        boolean isEmergency;

        CardItem(String id, String name, String langCode, boolean isEmergency) {
            this.id = id;
            this.name = name;
            this.langCode = langCode;
            this.isEmergency = isEmergency;
        }
    }
}