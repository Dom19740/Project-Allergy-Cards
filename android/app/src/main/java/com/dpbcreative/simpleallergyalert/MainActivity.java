package com.dpbcreative.simpleallergyalert;

import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();

        // Ensure we can draw under the system bars if needed, but set specific colors
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        
        // Set Status Bar color to match your header (#f3f4f6 is gray-100)
        window.setStatusBarColor(android.graphics.Color.parseColor("#f3f4f6"));
        
        // Set Navigation Bar color (bottom of screen)
        window.setNavigationBarColor(android.graphics.Color.parseColor("#f3f4f6"));

        // Make icons dark (black) so they are visible on the light gray background
        View decorView = window.getDecorView();
        int flags = decorView.getSystemUiVisibility();
        
        // Add the light status bar flag
        flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        
        // Add the light navigation bar flag (Android 8.0+)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        }
        
        decorView.setSystemUiVisibility(flags);
    }
}