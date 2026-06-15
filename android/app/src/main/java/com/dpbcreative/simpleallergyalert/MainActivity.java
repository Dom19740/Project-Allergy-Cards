package com.dpbcreative.simpleallergyalert;

import android.content.Intent;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
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

    private void triggerWidgetRefresh() {
        Intent intent = new Intent(this, AllergyWidgetProvider.class);
        intent.setAction(AllergyWidgetProvider.ACTION_REFRESH);
        sendBroadcast(intent);
    }
}
