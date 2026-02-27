import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { FastifyReply } from 'fastify'

/**
 * Global exception filter that ensures ALL errors — including unhandled
 * ones like Prisma failures or null-pointer exceptions — return a
 * descriptive message in the response body instead of a generic
 * "Internal Server Error".
 *
 * This is safe because election-api is an internal service, not
 * public-facing, so exposing error details aids debugging from
 * downstream consumers (gp-api) that relay these messages to
 * Slack / NewRelic.
 */
@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const reply = ctx.getResponse<FastifyReply>()

    // NestJS HttpExceptions already have a structured response — let
    // the default handler deal with them.
    if (exception instanceof HttpException) {
      return super.catch(exception, host)
    }

    // For anything else (Prisma errors, runtime exceptions, etc.),
    // build a response that includes the real error message.
    const message =
      exception instanceof Error ? exception.message : String(exception)
    const stack = exception instanceof Error ? exception.stack : undefined

    this.logger.error(`Unhandled exception: ${message}`, stack)

    const status = HttpStatus.INTERNAL_SERVER_ERROR
    reply.status(status).send({
      statusCode: status,
      message,
      error: 'Internal Server Error',
    })
  }
}
