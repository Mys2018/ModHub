import { create} from "zustand";

export type ModalMode = 'create' | 'add_version'

interface ModalState {
  isOpen: boolean,
  mode: ModalMode,
  modId: string | null,

  initialData? : {
    title?: string,
    description?: string,
    targetDevice?: string,
    androidVersion?: string
  } | null

  openCreateModal: () => void
  openAddVersionModal: (
      modId: string,
      initialData: {
        title: string,
        description: string,
        targetDevice: string,
        androidVersion: string
      }
  ) => void,
  closeModal: () => void
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  mode: 'create',
  modId: null,
  initialData: null,

  openCreateModal: () => set({
    isOpen: true,
    mode: 'create',
    modId: null,
    initialData: null
  }),

  openAddVersionModal: (modId, initialData) => set({
    isOpen: true,
    mode: 'add_version',
    modId,
    initialData
  }),

  closeModal: () => set({ isOpen: false, initialData: null, modId: null }),
}))