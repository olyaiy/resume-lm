export const FREE_PLAN_RESUME_LIMITS = {
  base: 2,
  tailored: 4,
} as const;

export type ResumeLimitType = keyof typeof FREE_PLAN_RESUME_LIMITS;

export function getResumeLimitExceededMessage(type: ResumeLimitType): string {
  const limit = FREE_PLAN_RESUME_LIMITS[type];
  const label = type === 'base' ? 'base resumes' : 'tailored resumes';
  return `Free plan limit reached: you can create up to ${limit} ${label}. Upgrade to Pro to create more.`;
}
