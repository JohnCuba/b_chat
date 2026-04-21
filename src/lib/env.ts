export const NODE_ENV = process.env.NODE_ENV || 'prod'

export const resolveEnv = <T>(variants: Record<typeof NODE_ENV, T>): T => {
  return variants[NODE_ENV] || variants.prod
}