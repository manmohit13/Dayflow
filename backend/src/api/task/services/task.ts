import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::task.task', ({ strapi }) => ({
  async findByOwner(userId: number) {
    return strapi.documents('api::task.task').findMany({
      filters: { owner: { id: userId } },
      populate: { category: true, Image: true },
    });
  },

  async getStats() {
    const total = await strapi.documents('api::task.task').count({});
    const done = await strapi.documents('api::task.task').count({
      filters: { isDone: true },
    });
    return { total, done, pending: total - done };
  },
}));