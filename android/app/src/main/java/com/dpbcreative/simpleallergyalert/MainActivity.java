package com.dpbcreative.simpleallergyalert;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final String PREFS_NAME = "AppPrefs";
    private static final String KEY_LAST_VERSION_CODE = "lastVersionCode";

    @Override
    public void onStart() {
        super.onStart();
        clearWebViewCacheOnUpdate();
    }

    @Override
    public void onPause() {
        super.onPause();
        triggerWidgetRefresh();
    }

    @Override
    public void onResume() {
        super.onResume();
        triggerWidgetRefresh();
    }

    private void clearWebViewCacheOnUpdate() {
        try {
            PackageInfo pInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
            int currentVersionCode = pInfo.versionCode;

            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            int lastVersionCode = prefs.getInt(KEY_LAST_VERSION_CODE, -1);

            if (currentVersionCode != lastVersionCode) {
                WebView webView = new WebView(getApplicationContext());
                webView.clearCache(true);
                prefs.edit().putInt(KEY_LAST_VERSION_CODE, currentVersionCode).apply();
            }
        } catch (PackageManager.NameNotFoundException e) {
            // Should never happen; ignore
        }
    }

    private void triggerWidgetRefresh() {
        Intent intent = new Intent(this, AllergyWidgetProvider.class);
        intent.setAction(AllergyWidgetProvider.ACTION_REFRESH);
        sendBroadcast(intent);
    }
}