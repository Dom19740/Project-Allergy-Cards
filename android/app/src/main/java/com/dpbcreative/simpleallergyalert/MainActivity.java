package com.dpbcreative.simpleallergyalert;

import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);
        
        // Ensure the native action bar is hidden if it's being shown
        if (getSupportActionBar() != null) {
            getSupportActionBar().hide();
        }
    }
}