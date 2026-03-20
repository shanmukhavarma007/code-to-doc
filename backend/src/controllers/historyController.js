import Generation from '../models/Generation.js'
import logger from '../utils/logger.js'

export const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const generations = await Generation.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('language output createdAt codeHash')

    const total = await Generation.countDocuments({ userId: req.user.id })

    res.json({
      generations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    next(error)
  }
}

export const deleteGeneration = async (req, res, next) => {
  try {
    const generation = await Generation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    })

    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' })
    }

    logger.info(`Generation deleted: ${req.params.id}`)
    res.json({ message: 'Generation deleted' })
  } catch (error) {
    next(error)
  }
}
