import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HealthService } from './health.service'
import { PrismaService } from '../prisma/prisma.service'
import { PinoLogger } from 'nestjs-pino'

describe('HealthService', () => {
  let service: HealthService
  let prisma: Pick<PrismaService, '$queryRaw'>
  let logger: Pick<PinoLogger, 'setContext' | 'error'>

  beforeEach(() => {
    prisma = {
      $queryRaw: vi.fn(),
    }

    logger = {
      setContext: vi.fn(),
      error: vi.fn(),
    }

    service = new HealthService(prisma as PrismaService, logger as PinoLogger)
  })

  it('returns true when database query succeeds', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ '?column?': 1 }])

    const result = await service.checkHealth()

    expect(result).toBe(true)
    expect(prisma.$queryRaw).toHaveBeenCalledOnce()
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('returns false and logs when database query fails', async () => {
    const error = new Error('db is down')
    vi.mocked(prisma.$queryRaw).mockRejectedValue(error)

    const result = await service.checkHealth()

    expect(result).toBe(false)
    expect(logger.error).toHaveBeenCalledWith({ err: error }, 'Health check failed => ')
  })
})
