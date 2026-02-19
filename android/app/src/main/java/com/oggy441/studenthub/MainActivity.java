package com.oggy441.studenthub;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetSyncPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
