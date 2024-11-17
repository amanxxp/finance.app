import {create} from "zustand";

type OpenTransactionState = {
    isOpen: boolean;
    id?: string;
    onOpen: (id: string)=> void;
    onClose: ()=> void;
};

export const useOpenTransaction = create<OpenTransactionState>((set)=>({
    isOpen: false,
    id: undefined,
    onOpen: (id: string)=> set({isOpen: true, id}),
    onClose: ()=>set({isOpen: false, id: undefined}),
}));