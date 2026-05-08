import { treaty } from '@elysiajs/eden'
import type { App } from '@b_chat/backend'

export const backend = treaty<App>(window.location.origin)
