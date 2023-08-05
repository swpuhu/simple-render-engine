type AnyFunc = {
    func: (...args: any[]) => void;
    context?: any;
};
let __eventMap: Record<string, AnyFunc[]> = {};

export const globalEvent = {
    on(event: string, fn: (...args: any[]) => void, context?: any) {
        if (!__eventMap[event]) {
            __eventMap[event] = [];
        }

        __eventMap[event].push({
            func: fn,
            context: context,
        });
    },
    off(event: string, fn: (...args: any[]) => void, context?: any) {
        if (!__eventMap[event]) {
            return;
        }

        const fnIndex = __eventMap[event].findIndex(
            item => item.func === fn && item.context === context
        );
        if (fnIndex >= 0) {
            __eventMap[event].splice(fnIndex, 1);
        }
    },

    getEventCallback(event: string): AnyFunc[] {
        return __eventMap[event] || [];
    },

    destroy() {
        __eventMap = {};
    },
};
