import type { Core } from '@strapi/strapi';
import { errors as strapiErrors } from '@strapi/utils';

const getErrorStatus = (error: Error & { status?: number; statusCode?: number }): number => {
  const status = error.status ?? error.statusCode;
  if (status !== undefined) return status;
  if (error instanceof strapiErrors.UnauthorizedError) return 401;
  if (error instanceof strapiErrors.ForbiddenError) return 403;
  if (error instanceof strapiErrors.NotFoundError) return 404;
  if (error instanceof strapiErrors.PayloadTooLargeError) return 413;
  if (error instanceof strapiErrors.RateLimitError) return 429;
  if (error instanceof strapiErrors.NotImplementedError) return 501;
  if (error instanceof strapiErrors.ApplicationError) return 400;
  return 500;
};

export default (_config: unknown, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: { status: number; body: unknown }, next: () => Promise<unknown>) => {
    try {
      await next();
    } catch (err) {
      const error = err as Error & { status?: number; statusCode?: number; details?: unknown };
      const status = getErrorStatus(error);

      if (status >= 500) strapi.log.error(error);

      ctx.status = status;
      ctx.body = {
        data: null,
        error: {
          status,
          name: status >= 500 ? 'InternalServerError' : error.name,
          message: status >= 500 ? 'Internal server error' : error.message,
          details: status >= 500 ? {} : error.details ?? {},
        },
      };
    }
  };
};