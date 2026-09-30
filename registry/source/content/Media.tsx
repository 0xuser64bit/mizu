"use client";
import {
  useState,
  type ImgHTMLAttributes,
  type VideoHTMLAttributes,
  type ReactNode,
} from "react";
/** Ref for an image that may have failed before hydration, when onError never reaches
 * React: a complete image without pixels that also refuses to decode is broken. */
const whenBroken = (fail: () => void) => (img: HTMLImageElement | null) => {
  if (img?.complete && !img.naturalWidth) img.decode?.().catch(fail);
};
export function Avatar({
  name,
  src,
  size = 44,
  className = "",
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState<string>();
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => Array.from(n)[0])
      .join("")
      .toUpperCase() || "?";
  return (
    <span
      className={`mizu-avatar ${className}`}
      role="img"
      aria-label={name || "Unknown person"}
      style={{ width: Math.max(24, size), height: Math.max(24, size) }}
    >
      {src && src !== failed ? (
        <img
          ref={whenBroken(() => setFailed(src))}
          src={src}
          alt=""
          onError={() => setFailed(src)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}
export function ImageFigure({
  src,
  alt,
  caption,
  className = "",
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { caption?: ReactNode }) {
  const [failed, setFailed] = useState<string>();
  return (
    <figure className={`mizu-image-figure ${className}`}>
      {src && src === failed ? (
        <div
          className="mizu-image-error"
          role="img"
          aria-label={alt || "Image unavailable"}
        >
          Image unavailable
        </div>
      ) : (
        <img
          {...props}
          ref={whenBroken(() => setFailed(String(src)))}
          src={src}
          alt={alt ?? ""}
          loading={props.loading ?? "lazy"}
          onError={(e) => {
            setFailed(String(src));
            props.onError?.(e);
          }}
        />
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
export function MediaPlayer({
  kind = "video",
  label,
  children,
  className = "",
  ...props
}: VideoHTMLAttributes<HTMLVideoElement> & {
  kind?: "video" | "audio";
  label: string;
}) {
  return (
    <figure className={`mizu-media-player ${className}`}>
      <figcaption>{label}</figcaption>
      {kind === "audio" ? (
        <audio {...props} controls aria-label={label}>
          {children}
        </audio>
      ) : (
        <video {...props} controls playsInline aria-label={label}>
          {children}
        </video>
      )}
    </figure>
  );
}
