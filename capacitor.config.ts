import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.garden.app",
  appName: "Garden",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  backgroundColor: "#000000",
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      // El color de fondo del nuevo sistema de splash de Android 12
      backgroundColor: "#000F11",
      // Le decimos explícitamente a Android 12 que no ponga un ícono encima del nuestro
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    LiveUpdates: {
      appId: 'b8a00d75', 
      channel: 'production',
      autoUpdateMethod: 'background',
      maxVersions: 2 // Recomendado para no llenar el almacenamiento del usuario
    }
  }
};
export default config;
