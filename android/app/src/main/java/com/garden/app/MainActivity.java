package com.garden.app; // El nombre de tu paquete estará aquí

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    
    // ====================== LA LÍNEA CLAVE ======================
    // Aplica el tema normal de la app DESPUÉS de que el Splash Screen
    // (controlado por el AndroidManifest y styles.xml) ha aparecido.
    // En Java, los puntos del nombre del estilo se convierten en guiones bajos.
    setTheme(R.style.AppTheme_NoActionBar);
    // ==========================================================

    super.onCreate(savedInstanceState); // Esta línea siempre debe ir después de setTheme
  }
}
