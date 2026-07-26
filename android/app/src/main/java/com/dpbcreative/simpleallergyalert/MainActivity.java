package com.dpbcreative.simpleallergyalert;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebView;
import com.android.installreferrer.api.InstallReferrerClient;
import com.android.installreferrer.api.InstallReferrerStateListener;
import com.android.installreferrer.api.ReferrerDetails;
import com.getcapacitor.BridgeActivity;
import java.util.regex.Pattern;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "InstallReferrer";
    private static final String PREFS_NAME = "AppPrefs";
    private static final String KEY_LAST_VERSION_CODE = "lastVersionCode";
    private static final String KEY_INSTALL_REFERRER_PROCESSED = "installReferrerProcessed";
    private static final String CAPACITOR_STORAGE_PREFS = "CapacitorStorage";
    private static final String KEY_INSTALL_REFERRER_REF = "installReferrerRef";
    private static final Pattern REF_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]{1,64}$");

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        captureInstallReferrer();
    }

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

    // Reads the Play Install Referrer string once per install and persists its
    // utm_campaign value (our affiliate ref, sent by marketing_site/includes.js
    // as part of the Play Store link) into Capacitor's storage so the webapp
    // can log its own campaign_landing/purchase events with a real "ref" param
    // on Android, instead of depending on GA4's automatic firstUserCampaignName
    // attribution. Gated on installReferrerProcessed so this only ever runs
    // once per install regardless of how many cold starts happen before the
    // JS side consumes the value.
    private void captureInstallReferrer() {
        final SharedPreferences appPrefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        if (appPrefs.getBoolean(KEY_INSTALL_REFERRER_PROCESSED, false)) {
            return;
        }

        final InstallReferrerClient referrerClient = InstallReferrerClient.newBuilder(getApplicationContext()).build();
        referrerClient.startConnection(new InstallReferrerStateListener() {
            @Override
            public void onInstallReferrerSetupFinished(int responseCode) {
                try {
                    if (responseCode == InstallReferrerClient.InstallReferrerResponse.OK) {
                        ReferrerDetails details = referrerClient.getInstallReferrer();
                        persistReferrerRef(details.getInstallReferrer());
                    }
                    // FEATURE_NOT_SUPPORTED / SERVICE_UNAVAILABLE: nothing to read - fall
                    // through and mark processed so we don't retry every cold start.
                } catch (Exception e) {
                    Log.w(TAG, "Failed to read install referrer", e);
                } finally {
                    appPrefs.edit().putBoolean(KEY_INSTALL_REFERRER_PROCESSED, true).apply();
                    referrerClient.endConnection();
                }
            }

            @Override
            public void onInstallReferrerServiceDisconnected() {
                // Deliberately not retrying here - installReferrerProcessed is still
                // false, so the next cold start's onCreate() will simply try again.
            }
        });
    }

    private void persistReferrerRef(String referrerUrl) {
        if (referrerUrl == null) {
            return;
        }

        // The referrer string looks like a query string
        // (utm_source=affiliate&utm_medium=referral&utm_campaign=REF) - Uri's
        // query parser handles the decoding for us.
        Uri uri = Uri.parse("https://install-referrer/?" + referrerUrl);
        String ref = uri.getQueryParameter("utm_campaign");

        if (ref == null || !REF_PATTERN.matcher(ref).matches()) {
            return;
        }

        // Written as a quoted JSON string so Capacitor Preferences' JS side
        // (storage.get(), which runs JSON.parse on the raw value) reads it back
        // as a plain string - same CapacitorStorage file AllergyWidgetProvider
        // already reads/writes elsewhere.
        SharedPreferences capacitorPrefs = getSharedPreferences(CAPACITOR_STORAGE_PREFS, MODE_PRIVATE);
        capacitorPrefs.edit().putString(KEY_INSTALL_REFERRER_REF, "\"" + ref + "\"").apply();
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
