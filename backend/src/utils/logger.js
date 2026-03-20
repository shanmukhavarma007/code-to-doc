import { createLogger, format, transports } from 'winston'

const { combine, timestamp, json, errors } = format

const logger = createLogger({
  level: 'info',
  format: combine(
    errors({ stackTraceFormatter: true }),
    timestamp(),
    json()
  ),
  defaultMeta: { service: 'code-to-doc-api' },
  transports: [
    new transports.Console()
  ]
})

export default logger
