import Generation from '../models/Generation.js'
import generateDocumentation from '../utils/openrouter.js'

export const generate = async (req, res) => {
  try {
    const { code, language } = req.body
    const codeHash = Generation.hashCode(code)

    const existing = await Generation.findOne({ userId: req.user.id, codeHash })
    if (existing) {
      console.log(`[Generate] Returning cached output for user ${req.user.id}`)
      return res.json({
        output: existing.output,
        cached: true
      })
    }

    console.log(`[Generate] Generating new documentation for user ${req.user.id}, language: ${language}`)
    const output = await generateDocumentation(code, language)

    const generation = new Generation({
      userId: req.user.id,
      language,
      codeHash,
      output
    })
    await generation.save()

    console.log(`[Generate] Documentation saved for user ${req.user.id}`)
    res.json({
      output,
      cached: false
    })
  } catch (error) {
    console.error(`[Generate] Error:`, error.message, `Status: ${error.status || 'unknown'}`)

    if (error.status === 429) {
      res.set('Retry-After', error.retryAfter || 60)
      return res.status(429).json({ error: error.message })
    }

    if (error.status === 504) {
      return res.status(504).json({ error: error.message })
    }

    if (error.status === 503 || error.status === 502 || error.status === 500) {
      return res.status(error.status).json({ error: error.message })
    }

    res.status(500).json({ error: error.message || 'Documentation generation failed' })
  }
}
