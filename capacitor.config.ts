import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.garden.app",
  appName: "Garden",
  webDir: "dist",
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000, // Duración de la visualización (en ms)
      launchAutoHide: false, // Ocultar automáticamente
      backgroundColor: "#000F11", // Color de fondo (ej: blanco)
      androidSplashResourceName: "splash", // Nombre del recurso generado (por defecto)
      androidScaleType: "CENTER_CROP", // Tipo de escalado de imagen
      showSpinner: true, // Mostrar spinner de carga
      androidSpinnerStyle: "large",
    },
  },
};

export default config;
