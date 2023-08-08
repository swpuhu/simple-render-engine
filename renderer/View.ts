import { SizeInterface } from './util';

export class View {
    private static __instance: View | null = null;
    public static getInstance(): View {
        if (!this.__instance) {
            this.__instance = new View();
        }
        return this.__instance;
    }
    private __designedSize: SizeInterface = { width: 0, height: 0 };
    private constructor() {}

    setDesignedSize(size: SizeInterface) {
        this.__designedSize = size;
    }

    getDesignedSize(): SizeInterface {
        return this.__designedSize;
    }
}
