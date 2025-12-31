package com.garden.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    // Aplica el tema normal de la app DESPUÉS de que el Splash Screen
    // (controlado por el AndroidManifest y styles.xml) ha aparecido.
    setTheme(R.style.AppTheme_NoActionBar);
    super.onCreate(savedInstanceState);
    
    handleIntent(getIntent());
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    handleIntent(intent);
  }

  private void handleIntent(Intent intent) {
    String action = intent.getAction();
    String type = intent.getType();
    String content = null;

    if (Intent.ACTION_SEND.equals(action)) {
      if ("text/plain".equals(type)) {
        content = intent.getStringExtra(Intent.EXTRA_TEXT);
      } else if (type != null && (type.startsWith("application/") || type.startsWith("text/"))) {
        Uri uri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
        if (uri != null) {
          content = readUri(uri);
        }
      }
    } else if (Intent.ACTION_VIEW.equals(action)) {
      Uri data = intent.getData();
      if (data != null) {
        content = readUri(data);
      }
    }

    if (content != null) {
      saveToCache(content);
      // Notify the webview if the bridge is already ready (hot resume)
      final String finalContent = content;
      if (getBridge() != null) {
        getBridge().executeOnMainThread(new Runnable() {
          @Override
          public void run() {
            getBridge().triggerWindowJSEvent("gardenImportAvailable");
          }
        });
      }
    }
  }

  private String readUri(Uri uri) {
    try {
      InputStream is = getContentResolver().openInputStream(uri);
      BufferedReader reader = new BufferedReader(new InputStreamReader(is));
      StringBuilder sb = new StringBuilder();
      String line;
      while ((line = reader.readLine()) != null) {
        sb.append(line).append("\n");
      }
      return sb.toString();
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }
  }

  private void saveToCache(String content) {
    try {
      File file = new File(getCacheDir(), "pending_import.json");
      FileOutputStream fos = new FileOutputStream(file);
      fos.write(content.getBytes());
      fos.close();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
