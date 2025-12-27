export {}

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: 'CUSTOMER' | 'BUSINESS_OWNER' | 'ADMIN' | 'MODERATOR';
      roles?: string[];
      onboardingCompleted?: boolean;
    }
  }
}