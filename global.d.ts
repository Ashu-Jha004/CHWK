declare module "*.css";
declare module "leaflet/dist/leaflet.css";
export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean;
    };
  }
}
