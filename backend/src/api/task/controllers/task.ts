import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { taskSchema } from '../../../utils/validators';

export default factories.createCoreController('api::task.task', ({ strapi }) => ({

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) throw new errors.UnauthorizedError('Please log in');

    const result = taskSchema.safeParse(ctx.request.body?.data);
    if (!result.success) {
      throw new errors.ValidationError('Invalid input', result.error.flatten());
    }

    const { category, ...taskData } = result.data;
    const entity = await strapi.documents('api::task.task').create({
      data: {
        ...taskData,
        owner: { connect: [user.documentId] },
        ...(category ? { category: { connect: [category] } } : {}),
      } as any,
      populate: { category: true },
    });

    const sanitized = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitized);
  },

  async update(ctx) {
    const result = taskSchema.partial().safeParse(ctx.request.body?.data);
    if (!result.success) {
      throw new errors.ValidationError('Invalid input', result.error.flatten());
    }

    const { category, ...taskData } = result.data;
    ctx.request.body.data = {
      ...taskData,
      ...(category === undefined
        ? {}
        : category === null
          ? { category: { set: [] } }
          : { category: { connect: [category] } }),
    };
    return await super.update(ctx);
  },
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) throw new errors.UnauthorizedError('Please log in');

    const isPrivileged = ['Manager', 'Admin'].includes(user.role?.name);

    // Managers and Admins see everything, with Strapi's normal behavior
    if (isPrivileged) {
      return await super.find(ctx);
    }

    // Members: force the filter to their own tasks
    const query = await this.sanitizeQuery(ctx);
    const results = await strapi.documents('api::task.task').findMany({
      ...query,
      filters: { ...(query.filters as object), owner: { id: user.id } },
    });

    const sanitized = await this.sanitizeOutput(results, ctx);
    return this.transformResponse(sanitized);
  },
  async mine(ctx) {
    const user = ctx.state.user;
    if (!user) throw new errors.UnauthorizedError('Please log in');

    const data = await strapi.service('api::task.task').findByOwner(user.id);
    ctx.body = { data };
  },

  async stats(ctx) {
    ctx.body = await strapi.service('api::task.task').getStats();
  },

  async toggle(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params; // in Strapi v5 this is the documentId

    const task = await strapi.documents('api::task.task').findOne({
      documentId: id,
      populate: { owner: true },
    });
    if (!task) throw new errors.NotFoundError('Task not found');

    const isOwner = task.owner?.id === user.id;
    const isManagerOrAdmin = ['Manager', 'Admin'].includes(user.role?.name);
    if (!isOwner && !isManagerOrAdmin) {
      throw new errors.ForbiddenError('You can only change your own tasks');
    }

    const updated = await strapi.documents('api::task.task').update({
      documentId: id,
      data: { isDone: !task.isDone },
    });
    ctx.body = { data: updated };
  },
}));