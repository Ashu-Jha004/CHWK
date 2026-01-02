// env.d.ts

declare namespace NodeJS {
  interface ProcessEnv {
    // Cloudflare Turnstile
    NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY: string;
    CLOUDFLARE_TURNSTILE_SECRET_KEY: string;

    // Cloudinary
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;

    // Database
    DATABASE_URL: string;
    DIRECT_URL: string;
    RESEND_API_KEY: string;
    NEXT_PUBLIC_APP_URL?: string;

    // Add other env variables as needed
  }
}
