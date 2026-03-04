package com.dpbcreative.simpleallergyalert;

import android.os.Bundle;
import android.view.Window;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Remove the window title before calling super.onCreate
        supportRequestWindowFeature(Window.FEATURE_NO_TITLE);
        
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);
        
        // Ensure the native action bar is hidden
        if (getSupportActionBar() != null) {
            getSupportActionBar().hide();
        }
    }
}