package com.dpbcreative.simpleallergyalert;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;

public class WidgetFactory implements RemoteViewsService.RemoteViewsFactory {

    private Context context;
    private List<JSONObject> cards = new ArrayList<>();

    public WidgetFactory(Context context) {
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
        cards.clear();
        try {
            SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String savedCardsJson = prefs.getString("savedCards", "[]");
            JSONArray array = new JSONArray(savedCardsJson);
            for (int i = 0; i < array.length(); i++) {
                cards.add(array.getJSONObject(i));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onDestroy() {
        cards.clear();
    }

    @Override
    public int getCount() {
        return cards.size();
    }

    @Override
    public RemoteViews getViewAt(int position) {
        if (position >= cards.size()) return null;

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_item);
        try {
            JSONObject card = cards.get(position);
            views.setTextViewText(R.id.card_name, card.optString("name", "Unnamed Card"));
            
            String langName = card.optString("languageName", "");
            String langCode = card.optString("languageCode", "").split("-")[0].toUpperCase();
            views.setTextViewText(R.id.lang_code, langName + " (" + langCode + ")");

            // Handle Dots
            int totalCards = cards.size();
            int[] dotIds = {R.id.dot_0, R.id.dot_1, R.id.dot_2};
            
            for (int i = 0; i < 3; i++) {
                if (i < totalCards) {
                    views.setViewVisibility(dotIds[i], View.VISIBLE);
                    if (i == position) {
                        views.setImageViewResource(dotIds[i], R.drawable.dot_active);
                    } else {
                        views.setImageViewResource(dotIds[i], R.drawable.dot_inactive);
                    }
                } else {
                    views.setViewVisibility(dotIds[i], View.GONE);
                }
            }

            // Set up click fill-in intent
            Bundle extras = new Bundle();
            extras.putString(AllergyWidgetProvider.EXTRA_CARD_ID, card.optString("id"));
            Intent fillInIntent = new Intent();
            fillInIntent.putExtras(extras);
            views.setOnClickFillInIntent(R.id.card_name, fillInIntent);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return views;
    }

    @Override
    public RemoteViews getLoadingView() {
        return null;
    }

    @Override
    public int getViewTypeCount() {
        return 1;
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public boolean hasStableIds() {
        return true;
    }
}