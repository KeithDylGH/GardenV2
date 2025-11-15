import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.garden.app",
  appName: "Garden",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
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
  },
};
export default config;
