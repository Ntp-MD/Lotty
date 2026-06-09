export const VALID_SCOPES = ["1y", "3y", "5y", "10y", "all"] as const;
export type ValidScope = typeof VALID_SCOPES[number];

export function validateScope(scope: string): ValidScope {
  if (VALID_SCOPES.includes(scope as ValidScope)) {
    return scope as ValidScope;
  }
  throw createError({
    statusCode: 400,
    message: `Invalid scope. Must be one of: ${VALID_SCOPES.join(", ")}`,
  });
}
