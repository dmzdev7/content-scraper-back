import express, { type Application } from 'express'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import adminRoutes from './routes/admin.routes.js'
import { config } from './config/index.js'
import { httpLogger } from './middlewares/logger.middleware.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './config/swagger.config.js'
import { generalLimiter } from './config/rate-limit.config.js'

// Crear la aplicación Express
const app: Application = express()

//Middleware para parsear JSON
app.use(express.json())

// Middleware de logging HTTP
app.use(httpLogger)

// ========== RATE LIMITING GENERAL ==========
// Aplicar a todas las rutas (excepto /api-docs)
app.use('/api', generalLimiter)

// ========== SWAGGER DOCUMENTATION ==========
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: `${config.app_name} API Docs`,
  }),
)

// Endpoint para obtener la especificación en JSON
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

// Rutas y endpoints
// ENDPOINT: GET / HTTP method && route (or path)
// The methods are: GET, POST, PUT, DELETE, PATCH, etc.
// The route is the path after the domain, e.g., /api/v1/users


// Auth routes
app.use(`${config.apiPrefix}/auth`, authRoutes)

// User routes
app.use(`${config.apiPrefix}/users`, userRoutes)

// Solo en desarrollo
if (config.env === 'development')
  app.use(`${config.apiPrefix}/admin`, adminRoutes)

export default app
