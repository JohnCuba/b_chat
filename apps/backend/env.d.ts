declare module "bun" {
  interface Env {
    PORT?: number
    NODE_ENV: 'dev' | 'prod';
    LOG_LEVEL: import('pino').Level
  }
}