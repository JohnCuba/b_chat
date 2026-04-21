import pino from "pino";
import { resolveEnv } from "./env";

export const LOG_LEVEL = process.env.LOG_LEVEL || 'debug'

const buildDevOptions = (): pino.LoggerOptions<never, boolean> => ({
  level: LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
})

const buildProdOprions = (): pino.LoggerOptions<never, boolean> => ({
  level: LOG_LEVEL,
})

export const logger = pino(resolveEnv({
  dev: buildDevOptions,
  prod: buildProdOprions,
})())
