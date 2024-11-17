import { create } from "zustand";

type OpenCategoryState = {
  isOpen: boolean;
  id?: string;
  onOpen: (id: string) => void;
  onClose: () => void;
};

export const useOpenCategory = create<OpenCategoryState>((set) => ({
  isOpen: false,
  id: undefined,
  onOpen: (id: string) => set({ isOpen: true, id }),
  onClose: () => set({ isOpen: false, id: undefined }),
}));
