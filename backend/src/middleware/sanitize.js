export const sanitizeInput = (req, _res, next) => {
  if (req.body?.code) {
    req.body.code = req.body.code
      .replace(/\x00/g, '')
      .replace(/[\x00-\x1F\x7F]/g, '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .trim()
  }
  next()
}
