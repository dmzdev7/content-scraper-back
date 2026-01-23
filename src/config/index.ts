import dotenv from 'dotenv'
import path from 'path'
import z from 'zod'

// 1. Cargar variables de entorno
// Cargamos .env (base) y .env.development (específico)
dotenv.config() // Carga .env por defecto
dotenv.config({
  path: path.resolve(process.cwd(), '.env.development'),
  override: true,
})

// 2. Esquema de validación estricto y limpio
const envSchema = z.object({
  // app
  APP_NAME: z.string().default('content-scraper'),

  // server
  PORT: z.string().default('4000').transform(Number),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  BASE_URL: z.string().url().default('http://localhost'),

  // api
  API_PREFIX: z.string().default('/api/v1'),

  // frontend
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  // resend & email
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().email().default('onboarding@resend.dev'),

  // database
  DATABASE_URL: z.string().url(),

  // jwt
  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
})

// 3. Validar y parsear (con try-catch)
let envServer: z.infer<typeof envSchema>

try {
  envServer = envSchema.parse(process.env)
} catch (error) {
  if (error instanceof z.ZodError) {
    const { fieldErrors } = error.flatten()
    console.error('❌ Error: Variables de entorno inválidas o faltantes:')
    console.error(JSON.stringify(fieldErrors, null, 2))
  } else {
    console.error('❌ Error inesperado al validar variables de entorno:', error)
  }
  process.exit(1)
}

// 4. Exportar configuración
export const config = {
  // App
  app_name: envServer.APP_NAME,

  // Server
  port: envServer.PORT,
  env: envServer.NODE_ENV,
  base_url: envServer.BASE_URL,

  // API
  apiPrefix: envServer.API_PREFIX,

  // Frontend
  frontendUrl: envServer.FRONTEND_URL,

  // Resend & Email
  resend: {
    apiKey: envServer.RESEND_API_KEY,
  },

  email: {
    from: envServer.EMAIL_FROM,
  },

  // Database
  db: {
    url: envServer.DATABASE_URL,
  },

  // JWT
  jwt: {
    secret: envServer.JWT_ACCESS_SECRET,
    refreshSecret: envServer.JWT_REFRESH_SECRET,
  },
} as const

export type AppConfig = typeof config
