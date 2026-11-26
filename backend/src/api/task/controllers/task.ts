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
    const body = ctx.request.body ?? {};
    if (!body.data || typeof body.data !== 'object' || Array.isArray(body.data)) {
      ctx.throw(400, 'Missing "data" payload in the request body');
    }

    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);
    await this.validateInput(body.data, ctx);
    const sanitizedInput = await this.sanitizeInput(body.data, ctx);

    const entity = await strapi.service('api::task.task').create({
      ...sanitizedQuery,
      data: {
        ...(sanitizedInput as Record<string, unknown>),
        owner: ctx.state.user.id,
      },
    });
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    ctx.status = 201;
    return this.transformResponse(sanitizedEntity);
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