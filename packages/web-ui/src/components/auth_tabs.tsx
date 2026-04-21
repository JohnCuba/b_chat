import cn from 'classnames'

type Props = {
  active: 'join' | 'create'
}

export const AuthTabs = (props: Props) => {
  return (
    <div role="tablist" class="tabs tabs-box">
      <a
        role="tab"
        class={cn('tab flex-1', { 'tab-active': props.active === 'join' })}
        href="/join"
      >
        Войти
      </a>
      <a
        role="tab"
        class={cn('tab flex-1', { 'tab-active': props.active === 'create' })}
        href="/create"
      >
        Создать
      </a>
    </div>
  )
}