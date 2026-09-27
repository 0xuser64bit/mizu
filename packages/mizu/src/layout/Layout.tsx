import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
export function Stack({ gap = 20, direction = "column", align = "stretch", wrap = false, className = "", style, ...props }: HTMLAttributes<HTMLDivElement> & { gap?: number; direction?: "row" | "column"; align?: CSSProperties["alignItems"]; wrap?: boolean }) {
 return <div {...props} className={`mizu-stack ${className}`} style={{display:"flex",flexDirection:direction,gap,alignItems:align,flexWrap:wrap ? "wrap" : "nowrap",...style}} />;
}
export function Grid({ minWidth = 220, gap = 24, className = "", style, ...props }: HTMLAttributes<HTMLDivElement> & { minWidth?: number; gap?: number }) {
 return <div {...props} className={`mizu-grid ${className}`} style={{display:"grid",gridTemplateColumns:`repeat(auto-fit, minmax(min(100%, ${Math.max(1,minWidth)}px), 1fr))`,gap,...style}} />;
}
export function AspectRatio({ ratio = 16/9, className = "", style, ...props }: HTMLAttributes<HTMLDivElement> & { ratio?: number }) {
 return <div {...props} className={`mizu-aspect-ratio ${className}`} style={{aspectRatio:Number.isFinite(ratio) && ratio > 0 ? ratio : 1,...style}} />;
}
export function ScrollArea({ label, maxHeight = 300, className = "", style, ...props }: HTMLAttributes<HTMLDivElement> & { label: string; maxHeight?: number | string }) {
 return <div {...props} role="region" aria-label={label} tabIndex={0} className={`mizu-scroll-area ${className}`} style={{maxHeight,overflow:"auto",...style}} />;
}
export function AppShell({ header, sidebar, footer, children, mainId = "mizu-main", mainTag: Main = "main", className = "" }: { header?: ReactNode; sidebar?: ReactNode; footer?: ReactNode; children: ReactNode; mainId?: string; mainTag?: "main" | "section"; className?: string }) {
 return <div className={`mizu-app-shell ${className}`}><a className="mizu-skip-link" href={`#${mainId}`}>Skip to content</a>{header && <header>{header}</header>}<div className="mizu-app-body">{sidebar && <aside>{sidebar}</aside>}<Main id={mainId} tabIndex={-1}>{children}</Main></div>{footer && <footer>{footer}</footer>}</div>;
}
