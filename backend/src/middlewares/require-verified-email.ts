import { errors } from '@strapi/utils';
import type { Core } from '@strapi/strapi';

export default (_config: unknown, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: () => Promise<unknown>) => {
    if (ctx.method === 'POST' && ctx.path === '/api/auth/local') {
      const identifier = ctx.request.body?.identifier;

      if (identifier) {
        const user = await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { $or: [{ email: identifier }, { username: identifier }] },
        });

        if (user && !user.emailVerified) {
          throw new errors.ForbiddenError('Please verify your email with the OTP first');
        }
      }
    }
    await next();
  };
};