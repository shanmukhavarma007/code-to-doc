import { Router } from 'express'
import { getHistory, deleteGeneration } from '../controllers/historyController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { validateParams, objectIdSchema } from '../middleware/inputValidator.js'

const router = Router()

router.get('/', authMiddleware, getHistory)
router.delete('/:id', authMiddleware, validateParams(objectIdSchema), deleteGeneration)

export default router
