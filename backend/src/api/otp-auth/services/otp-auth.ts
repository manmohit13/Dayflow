import crypto from 'crypto';

export default ({ strapi }: { strapi: any }) => ({
  async sendOtp(user: { id: any; email: any; }) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: user.id },
      data: { otpHash, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    });
    await strapi.plugin('email').service('email').send({
      to: user.email,
      subject: 'Your verification code',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });
  },

  async verifyOtp(email: any, otp: crypto.BinaryLike) {
    const user = await strapi.db.query('plugin::users-permissions.user')
      .findOne({ where: { email } });
    const hash = crypto.createHash('sha256').update(otp).digest('hex');
    if (!user || user.otpHash !== hash || new Date(user.otpExpiresAt) < new Date()) {
      return false;
    }
    await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: user.id },
      data: { emailVerified: true, otpHash: null, otpExpiresAt: null },
    });
    return true;
  },
});