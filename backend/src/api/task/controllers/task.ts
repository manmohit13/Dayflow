import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::task.task', ({ strapi }) => ({
  // GET /api/tasks -> only my tasks
  async find(ctx) {
    ctx.query = {
      ...ctx.query,
      filters: { ...(ctx.query.filters as object), owner: ctx.state.user.id },
    };
    return super.find(ctx);
  },

  // POST /api/tasks -> automatically set the owner
  async create(ctx) {
    ctx.request.body.data = {
      ...ctx.request.body.data,
      owner: ctx.state.user.id,
    };
    return super.create(ctx);
  },

  // GET /api/tasks/mine -> custom endpoint (with category)
  async mine(ctx) {
    const tasks = await strapi.documents('api::task.task').findMany({
      filters: { owner: ctx.state.user.id },
      populate: ['category'],
    });
    return { data: tasks };
  },
}));