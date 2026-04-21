import { treaty } from '@elysiajs/eden'
import type { App } from '../../..'

export const backend = treaty<App>('localhost:3010')