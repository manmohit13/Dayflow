import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::task.task', {
  config: {
    findOne: {
      policies: ['global::is-owner-or-manager'],
    },
    create: {
      policies: ['global::validate-task'],
    },
    update: {
      policies: [
        'global::is-owner-or-manager',
        { name: 'global::validate-task', config: { partial: true } },
      ],
    },
    delete: {
      policies: ['global::is-owner-or-manager'],
    },
  },
});