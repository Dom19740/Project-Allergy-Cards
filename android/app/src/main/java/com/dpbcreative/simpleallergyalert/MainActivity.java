package com.dpbcreative.simpleallergyalert;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onPause() {
        super.onPause();
        // Trigger a widget refresh whenever the app is paused (e.g., user goes to home screen)
        triggerWidgetRefresh();
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Also refresh when returning to the app to ensure consistency
        triggerWidgetRefresh();
    }

    private void triggerWidgetRefresh() {
        Intent intent = new Intent(this, AllergyWidgetProvider.class);
        intent.setAction(AllergyWidgetProvider.ACTION_REFRESH);
        sendBroadcast(intent);
    }
}