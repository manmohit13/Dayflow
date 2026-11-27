export default {
  routes: [
    {
      method: 'GET',
      path: '/tasks/mine',
      handler: 'task.mine',
    },
    {
      method: 'GET',
      path: '/tasks/stats',
      handler: 'task.stats',
      config: {
        policies: [
          { name: 'global::is-role', config: { roles: ['Manager', 'Admin'] } },
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/tasks/:id/toggle',
      handler: 'task.toggle',
      config: { policies: ['global::is-owner-or-manager'] },
    },
  ],
};