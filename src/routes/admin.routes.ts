import { Router, type Request, type Response } from 'express'
import { config } from '../config/index.js'
import { authenticate } from '../middlewares/auth.middleware.js'
import { authorize } from '../middlewares/authorize.middleware.js'
import { cleanupAllExpiredTokens } from '../jobs/cleanup-tokens.job.js'

const router: Router = Router()

// Solo en desarrollo y solo para ADMIN
if (config.env === 'development') {
  router.post(
    '/cleanup-tokens',
    authenticate,
    authorize('ADMIN'),
    async (_req: Request, res: Response) => {
      try {
        await cleanupAllExpiredTokens()
        res.json({
          status: 'success',
          message: 'Limpieza de tokens ejecutada',
        })
      } catch (error) {
        res.status(500).json({
          status: 'error',
          message: 'Error en limpieza',
        })
      }
    },
  )
}

export default router
