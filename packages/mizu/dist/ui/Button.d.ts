import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
export type ButtonVariant = "solid" | "ghost" | "inverse";
export type ButtonSize = "md" | "sm";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    arrow?: boolean;
}
export declare const Button: import("react").ForwardRefExoticComponent<ButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    arrow?: boolean;
    children: ReactNode;
}
export declare function ButtonLink({ variant, size, arrow, className, children, ...props }: ButtonLinkProps): import("react").JSX.Element;
//# sourceMappingURL=Button.d.ts.map