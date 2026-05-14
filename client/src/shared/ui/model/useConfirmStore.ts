import { create } from "zustand";

interface ConfirmStore {
  isOpen: boolean,
  title: string,
  message: string,

  cancelButtonText: string,
  agreeButtonText: string,

  onConfirm: () => void,

  openConfirm: (title: string, message: string, onConfirm: () => void) => void,
  closeConfirm: () => void
}

export const useConfirmStore = create<ConfirmStore>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  cancelButtonText: 'Отмена',
  agreeButtonText: 'Да, удалить',

  onConfirm: () => { },
  openConfirm: (title, message, onConfirm) => set({
    isOpen: true,
    title,
    message,
    onConfirm
  }),

  closeConfirm: () => set({ isOpen: false })
}))