import { type ReactNode } from "react";
type WipeContextValue = {
    wipe: (label?: string) => Promise<void>;
};
export declare function usePageWipe(): WipeContextValue;
export declare function PageWipeProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=PageWipe.d.ts.map