import { randomUUID } from 'crypto'
import { LoggerModule } from 'nestjs-pino'
import pino from 'pino'
import { redactLine } from './log-redaction'

const isLocal = process.env.NODE_ENV !== 'production'

export const loggerModule = LoggerModule.forRoot({
  assignResponse: true,
  pinoHttp: {
    base: null,
    level: process.env.LOG_LEVEL,
    transport: isLocal
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
    genReqId: (req) => req.id ?? randomUUID(),
    customProps: (req) => ({
      requestId: req.id,
      request: {
        method: req.method,
        // @ts-expect-error - req.originalUrl is not typed
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        url: req.originalUrl,
      },
    }),
    customReceivedMessage: () => 'Request received',
    customSuccessMessage: () => 'Request completed',
    customErrorMessage: () => 'Request completed',
    customAttributeKeys: { res: 'response', responseTime: 'responseTimeMs' },
    hooks: {
      streamWrite: redactLine,
    },
    formatters: {
      log: (obj) => {
        for (const key of Object.keys(obj)) {
          if (obj[key] instanceof Error) {
            obj[key] = pino.stdSerializers.err(obj[key])
          }
        }
        return obj
      },
    },
    serializers: {
      req: () => undefined,
      res: (res) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        statusCode: res.statusCode,
        bytes: Number(res.headers['content-length']),
      }),
    },
  },
})
