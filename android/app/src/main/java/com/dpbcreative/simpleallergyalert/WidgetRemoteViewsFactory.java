package com.dpbcreative.simpleallergyalert;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;

public class WidgetRemoteViewsFactory implements RemoteViewsService.RemoteViewsFactory {
    private Context context;
    private List<JSONObject> cards = new ArrayList<>();

    public WidgetRemoteViewsFactory(Context context) {
        this.context = context;
    }

    @Override
    public void onDataSetChanged() {
        cards.clear();
        try {
            SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String savedCardsJson = prefs.getString("saved_cards", "[]");
            JSONArray array = new JSONArray(savedCardsJson);
            
            for (int i = 0; i < array.length(); i++) {
                JSONObject card = array.getJSONObject(i);
                // Filter out emergency cards from the list as requested
                if (!"emergency-slot".equals(card.optString("id"))) {
                    cards.add(card);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public RemoteViews getViewAt(int position) {
        if (position >= cards.size()) return null;

        JSONObject card = cards.get(position);
        RemoteViews rv = new RemoteViews(context.getPackageName(), R.layout.widget_card_item);
        
        rv.setTextViewText(R.id.card_name, card.optString("name", "Allergy Card"));
        rv.setTextViewText(R.id.card_lang, card.optString("languageCode", "EN").toUpperCase());

        // Fill in click intent
        Intent fillInIntent = new Intent();
        fillInIntent.putExtra("card_id", card.optString("id"));
        rv.setOnClickFillInIntent(R.id.card_container, fillInIntent);

        return rv;
    }

    @Override public int getCount() { return cards.size(); }
    @Override public RemoteViews getLoadingView() { return null; }
    @Override public int getViewTypeCount() { return 1; }
    @Override public long getItemId(int position) { return position; }
    @Override public boolean hasStableIds() { return true; }
    @Override public void onCreate() {}
    @Override public void onDestroy() {}
}