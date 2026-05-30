declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL?: string;
    DIRECT_URL?: string;
    MONGODB_URI?: string;
    MONGODB_ENABLED?: string;
    JWT_SECRET?: string;
    NEXTAUTH_URL?: string;
    NEXTAUTH_SECRET?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
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
    SENTRY_DSN?: string;
    NEXT_PUBLIC_SENTRY_DSN?: string;
    SENTRY_AUTH_TOKEN?: string;
    SENTRY_ORG?: string;
    SENTRY_PROJECT?: string;
    SENTRY_RELEASE?: string;
    NEXT_PUBLIC_SENTRY_RELEASE?: string;
    SENTRY_ENVIRONMENT?: string;
    VERCEL_ENV?: string;
    VERCEL_GIT_COMMIT_SHA?: string;
    NEXT_PUBLIC_VERCEL_ENV?: string;
    ENCRYPTION_KEY?: string;
    CRON_SECRET?: string;
  }
}
