import { signal, createModel, useModel, effect, Signal } from "@preact/signals";

type Name = string | undefined;

const name = signal<Name>(sessionStorage.getItem('name') || undefined);

const UserModel = createModel<{
  name: Signal<Name>
}>(() => {

  effect(() => {
    if (name.value) {
      sessionStorage.setItem('name', name.value);
    } else {
      sessionStorage.removeItem('name')
    }
  })

  return {
    name,
  }
});

export const useUser = () => useModel(UserModel);