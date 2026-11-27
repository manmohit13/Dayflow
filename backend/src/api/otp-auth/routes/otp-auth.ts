export default {
  routes: [
    {
      method: 'POST',
      path: '/otp-auth/send',
      handler: 'otp-auth.send',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/otp-auth/verify',
      handler: 'otp-auth.verify',
      config: { auth: false },
    },
  ],
};