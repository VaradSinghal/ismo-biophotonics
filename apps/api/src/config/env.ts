import { z } from 'zod';

const bool = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection URL'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),

  /** Comma-separated list of allowed browser origins, e.g. https://app.vercel.app,http://localhost:5173 */
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  COOKIE_SECURE: bool.optional(),
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  /** Number of reverse proxies in front of the app (Render = 1). Needed for correct client IPs. */
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  RATE_LIMIT_ENABLED: bool.default('true'),

  /** Shared secret for the scheduled "due tomorrow" notification job. */
  CRON_SECRET: z.string().min(32).optional(),
  /** Base64-encoded Firebase service account JSON. Push notifications are disabled if absent. */
  FIREBASE_SERVICE_ACCOUNT_BASE64: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
    // eslint-disable-next-line no-console
    console.error(`Invalid environment configuration:\n${issues.join('\n')}`);
    process.exit(1);
  }
  return parsed.data;
}

const raw = loadEnv();

export const env = {
  ...raw,
  isProd: raw.NODE_ENV === 'production',
  isTest: raw.NODE_ENV === 'test',
  corsOrigins: raw.CORS_ORIGINS.split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  cookieSecure: raw.COOKIE_SECURE ?? raw.NODE_ENV === 'production',
};
