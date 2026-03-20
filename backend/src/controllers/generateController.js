import Generation from '../models/Generation.js'
import generateDocumentation from '../utils/openrouter.js'
import logger from '../utils/logger.js'

export const generate = async (req, res, next) => {
  try {
    const { code, language } = req.body
    const codeHash = Generation.hashCode(code)

    const existing = await Generation.findOne({ userId: req.user.id, codeHash })
    if (existing) {
      return res.json({
        output: existing.output,
        cached: true
      })
    }

    const output = await generateDocumentation(code, language)

    const generation = new Generation({
      userId: req.user.id,
      language,
      codeHash,
      output
    })
    await generation.save()

    logger.info(`Documentation generated for user ${req.user.id}, language: ${language}`)

    res.json({
      output,
      cached: false
    })
  } catch (error) {
    if (error.status === 429) {
      res.set('Retry-After', error.retryAfter)
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' })
    }

    if (error.status === 504) {
      return res.status(504).json({ error: 'Documentation generation timed out. Please try again.' })
    }

    logger.error('Generation error:', error.message)
    next(error)
  }
}
