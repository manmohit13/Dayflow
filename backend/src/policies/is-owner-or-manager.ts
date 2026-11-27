import { errors } from '@strapi/utils';

export default async (policyContext: { state: { user: any; }; params: { id: any; }; }, _config: any, { strapi }: any) => {
  const user = policyContext.state.user;
  if (!user) return false; // not logged in
  if (!user.emailVerified) return false; // email not verified yet

  // Managers and Admins can act on any task
  const roleName = user.role?.name;
  if (['Manager', 'Admin'].includes(roleName)) return true;

  // Everyone else: load the task and compare the owner
  const documentId = policyContext.params?.id;
  const task = await strapi.documents('api::task.task').findOne({
    documentId,
    populate: { owner: true },
  });

  if (!task) throw new errors.NotFoundError('Task not found');

  return task.owner?.id === user.id; // false → 403 Forbidden
};