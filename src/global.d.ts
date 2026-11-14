declare global {
    type Nullable<T> = T | null;

    interface IModalState {
        open?: boolean;
        onClose?: () => void;
    }
}

export {};
