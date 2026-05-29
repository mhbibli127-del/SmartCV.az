declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL?: string;
    DIRECT_URL?: string;
    MONGODB_URI?: string;
    JWT_SECRET?: string;
    NEXTAUTH_URL?: string;
    NEXTAUTH_SECRET?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    OPENAI_API_KEY?: string;
    EMAIL_HOST?: string;
    EMAIL_PORT?: string;
    EMAIL_USER?: string;
    EMAIL_PASS?: string;
    EMAIL_FROM?: string;
    NEXT_PUBLIC_APP_URL?: string;
    UPSTASH_REDIS_REST_URL?: string;
    UPSTASH_REDIS_REST_TOKEN?: string;
    PINECONE_API_KEY?: string;
    PINECONE_INDEX?: string;
    LIVEBLOCKS_SECRET_KEY?: string;
    NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY?: string;
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?: string;
    NEXT_PUBLIC_POSTHOG_ENABLED?: string;
    NEXT_PUBLIC_POSTHOG_KEY?: string;
    NEXT_PUBLIC_POSTHOG_HOST?: string;
    SENTRY_DSN?: string;
    NEXT_PUBLIC_SENTRY_DSN?: string;
    SENTRY_ENVIRONMENT?: string;
    ENCRYPTION_KEY?: string;
    CRON_SECRET?: string;
  }
}
