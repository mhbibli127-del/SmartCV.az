declare namespace NodeJS {
  interface ProcessEnv {
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?: string;
    NEXT_PUBLIC_POSTHOG_KEY?: string;
    NEXT_PUBLIC_POSTHOG_HOST?: string;
    LEONARDO_API_KEY?: string;
    LEONARDO_MODEL_ID?: string;
    PINECONE_API_KEY?: string;
    PINECONE_INDEX?: string;
    LIVEBLOCKS_SECRET_KEY?: string;
    NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY?: string;
    SENTRY_DSN?: string;
    NEXT_PUBLIC_SENTRY_DSN?: string;
    SENTRY_ENVIRONMENT?: string;
    UPSTASH_REDIS_REST_URL?: string;
    UPSTASH_REDIS_REST_TOKEN?: string;
  }
}
