import { errors } from '@strapi/utils';
import { taskSchema } from '../utils/validators';

interface PolicyContext {
  request: {
    body?: {
      data?: unknown;
    };
  };
}

interface PolicyConfig {
  partial?: boolean;
}

export default (policyContext: PolicyContext, config: PolicyConfig = {}): boolean => {
  const schema = config.partial ? taskSchema.partial() : taskSchema;
  const result = schema.safeParse(policyContext.request.body?.data);

  if (!result.success) {
    throw new errors.ValidationError('Invalid input', result.error.flatten());
  }

  return true;
};
