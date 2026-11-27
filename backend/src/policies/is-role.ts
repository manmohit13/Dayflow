interface PolicyContext {
  state: {
    user?: {
      emailVerified?: boolean | null;
      role?: {
        name: string;
      } | null;
    } | null;
  };
}

interface PolicyConfig {
  roles: string[];
}

export default (policyContext: PolicyContext, config: PolicyConfig): boolean => {
  const user = policyContext.state.user;

  if (!user?.emailVerified) return false; // not logged in, or email not verified

  const roleName = user.role?.name;
  if (!roleName) return false; // the user has no role

  return config?.roles?.includes(roleName) ?? false;
};