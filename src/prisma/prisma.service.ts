import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'
import { PinoLogger } from 'nestjs-pino'

const PRISMA_LOG_LEVELS = [
  'info',
  'warn',
  'error',
  ...(process.env.LOG_LEVEL === 'debug' ? ['query' as Prisma.LogLevel] : []),
]

/**
 * Builds a DATABASE_URL with connection pool parameters appended.
 * Prisma uses `connection_limit` and `pool_timeout` as URL query params
 * to control its internal connection pool.
 *
 * Defaults: connection_limit=10, pool_timeout=20 (seconds).
 * Override via PRISMA_CONNECTION_LIMIT and PRISMA_POOL_TIMEOUT env vars.
 */
function buildDatabaseUrl(): string {
  const baseUrl = process.env.DATABASE_URL || ''
  const connectionLimit =
    parseInt(process.env.PRISMA_CONNECTION_LIMIT || '', 10) || 10
  const poolTimeout =
    parseInt(process.env.PRISMA_POOL_TIMEOUT || '', 10) || 20

  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}connection_limit=${connectionLimit}&pool_timeout=${poolTimeout}`
}

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query'>
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly logger: PinoLogger) {
    super({
      datasources: {
        db: {
          url: buildDatabaseUrl(),
        },
      },
      log: PRISMA_LOG_LEVELS.map((level) => ({
        emit: 'event',
        level: level as Prisma.LogLevel,
      })),
      errorFormat: 'pretty',
    })
    this.logger.setContext(PrismaService.name)
  }

  async onModuleInit() {
    await this.$connect()

    this.$on('query', (event: Prisma.QueryEvent) => {
      this.logger.debug(
        {
          query: event.query,
          params: event.params,
          durationMs: event.duration,
        },
        'Completed SQL Query',
      )
    })
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
