import { ArrowIcon } from "../ui/icons";
import type { HTMLAttributes, ReactNode } from "react";
import { CopyButton } from "../feedback/CopyButton";
export function Kbd({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <kbd {...props} className={`mizu-kbd ${className}`}>
      {children}
    </kbd>
  );
}
export function CodeBlock({
  code,
  language = "text",
  filename,
  className = "",
}: {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}) {
  return (
    <figure className={`mizu-code-block ${className}`}>
      <figcaption>
        <span>{filename ?? language}</span>
        <CopyButton text={code} aria-label="Copy code">
          Copy
        </CopyButton>
      </figcaption>
      <pre tabIndex={0} aria-label={filename ?? `${language} code`}>
        <code>{code}</code>
      </pre>
    </figure>
  );
}
export function Quote({
  children,
  author,
  cite,
  className = "",
}: {
  children: ReactNode;
  author?: string;
  cite?: string;
  className?: string;
}) {
  return (
    <figure className={`mizu-quote ${className}`}>
      <blockquote cite={cite}>{children}</blockquote>
      {author && (
        <figcaption>{cite ? <a href={cite}>{author}</a> : author}</figcaption>
      )}
    </figure>
  );
}
export function Prose({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={`mizu-prose ${className}`}>
      {children}
    </div>
  );
}
export function LinkCard({
  href,
  title,
  description,
  eyebrow,
  className = "",
  ...props
}: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "title"> & {
  title: string;
  description?: string;
  eyebrow?: string;
}) {
  return (
    <a {...props} href={href} className={`mizu-link-card ${className}`}>
      {eyebrow && <small>{eyebrow}</small>}
      <strong>
        {title}
        <ArrowIcon direction="diagonal" />
      </strong>
      {description && <p>{description}</p>}
    </a>
  );
}
export function FileCard({
  href,
  name,
  size,
  type = "File",
  download = true,
  className = "",
}: {
  href: string;
  name: string;
  size?: number;
  type?: string;
  download?: boolean;
  className?: string;
}) {
  const bytes =
    size === undefined
      ? undefined
      : Math.max(0, Number.isFinite(size) ? size : 0);
  const formatted =
    bytes === undefined
      ? ""
      : bytes < 1024
        ? `${bytes} B`
        : bytes < 1048576
          ? `${(bytes / 1024).toFixed(1)} KiB`
          : `${(bytes / 1048576).toFixed(1)} MiB`;
  return (
    <a
      className={`mizu-file-card ${className}`}
      href={href}
      download={download ? name : undefined}
    >
      <ArrowIcon direction="down" className="mizu-file-icon" />
      <span>
        <strong>{name}</strong>
        <small>
          {type}
          {formatted && ` · ${formatted}`}
        </small>
      </span>
      <span className="mizu-sr-only">{download ? "Download" : "Open"}</span>
    </a>
  );
}
