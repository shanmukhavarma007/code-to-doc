export const sanitizeInput = (text) => {
  if (typeof text !== 'string') return ''
  return text
    .replace(/\x00/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim()
}

export const truncateOutput = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
