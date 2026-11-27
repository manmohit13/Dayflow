interface RequestLoggerContext {
  method: string;
  url: string;
  status: number;
}

interface RequestLoggerNext {
  (): Promise<unknown>;
}

export default () => async (ctx: RequestLoggerContext, next: RequestLoggerNext): Promise<void> => {
  const start = Date.now();
  await next();
  strapi.log.info(`${ctx.method} ${ctx.url} → ${ctx.status} (${Date.now() - start}ms)`);
};