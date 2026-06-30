import type { ComponentChildren, Ref } from 'preact';

type Props = {
  modalRef: Ref<HTMLDialogElement>
	children?: ComponentChildren;
}

export const Modal = (props: Props) => {
  return (
    <dialog ref={props.modalRef} class="modal">
      <div class="modal-box">
				{props.children}
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}
