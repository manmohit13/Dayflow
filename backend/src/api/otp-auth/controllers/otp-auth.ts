import { errors } from '@strapi/utils';
import { z } from 'zod';
import type { Core } from '@strapi/strapi';

const sendSchema = z.object({ email: z.string().email() });
const verifySchema = z.object({ email: z.string().email(), otp: z.string().length(6) });

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async send(ctx: { request: { body: unknown; }; body: { message: string; }; }) {
    const parsed = sendSchema.safeParse(ctx.request.body);
    if (!parsed.success) {
      throw new errors.ValidationError('Invalid input', parsed.error.flatten());
    }

    const user = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({ where: { email: parsed.data.email } });

    if (user && !user.emailVerified) {
      await strapi.service('api::otp-auth.otp-auth').sendOtp(user);
    }

    // same answer whether or not the email exists, so attackers can't discover accounts
    ctx.body = { message: 'If the account exists, an OTP has been sent.' };
  },

  async verify(ctx: { request: { body: unknown; }; body: { message: string; }; }) {
    const parsed = verifySchema.safeParse(ctx.request.body);
    if (!parsed.success) {
      throw new errors.ValidationError('Invalid input', parsed.error.flatten());
    }

    const ok = await strapi
      .service('api::otp-auth.otp-auth')
      .verifyOtp(parsed.data.email, parsed.data.otp);

    if (!ok) throw new errors.ApplicationError('Invalid or expired OTP');

    ctx.body = { message: 'Email verified. You can log in now.' };
  },
});