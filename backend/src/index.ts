import type { Core } from '@strapi/strapi';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const roles = await strapi.db
      .query('plugin::users-permissions.role')
      .findMany();

    const authenticatedRoles = roles.filter((role) => role.type !== 'public');
    if (authenticatedRoles.length === 0) {
      throw new Error('No authenticated Users & Permissions roles were found');
    }

    const requiredPermissions = [
      'api::category.category.find',
      'plugin::users-permissions.user.me',
      'plugin::upload.content-api.upload',
    ];

    for (const role of authenticatedRoles) {
      for (const action of requiredPermissions) {
        const permission = await strapi.db
          .query('plugin::users-permissions.permission')
          .findOne({ where: { action, role: { id: role.id } } });

        if (!permission) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: { action, role: role.id },
          });
        }
      }
    }

    // Runs every time a new user is created (e.g. on register)
    strapi.db.lifecycles.subscribe({
      models: ['plugin::users-permissions.user'],

      async afterCreate(event) {
        const user = event.result;
        if (user.emailVerified) return; // already verified, nothing to send

        try {
          await strapi.service('api::otp-auth.otp-auth').sendOtp(user);
        } catch (err) {
          strapi.log.error(`Could not send OTP to ${user.email}: ${err}`);
        }
      },
    });
  },
};