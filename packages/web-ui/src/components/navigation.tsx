import type { ComponentChildren } from 'preact'
import { AppTitle } from './app_title'

type Props = {
  children?: ComponentChildren
}

export const Navigation = (props: Props) => {
  return (
    <div class="navbar bg-base-100 shadow-sm px-4">
      <span class="text-xl font-bold"><AppTitle /></span>
      <div class="flex-1" />
      {props.children}
    </div>
  )
}
