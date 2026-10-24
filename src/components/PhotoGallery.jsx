import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { initials } from "../utils/format";
import { IconButton } from "./ui";

export function Lightbox({ images, index, onClose, onMove }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onMove(1);
      if (e.key === "ArrowLeft") onMove(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onMove]);

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={onClose}>
      <IconButton label="Close" variant="glass" className="lightbox__close" onClick={onClose}>
        <X size={20} />
      </IconButton>
      {images.length > 1 ? (
        <IconButton label="Previous photo" variant="glass" className="lightbox__nav lightbox__nav--prev" onClick={(e) => (e.stopPropagation(), onMove(-1))}>
          <ChevronLeft size={22} />
        </IconButton>
      ) : null}
      <img key={index} src={images[index]} alt={`Photo ${index + 1} of ${images.length}`} onClick={(e) => e.stopPropagation()} />
      {images.length > 1 ? (
        <IconButton label="Next photo" variant="glass" className="lightbox__nav lightbox__nav--next" onClick={(e) => (e.stopPropagation(), onMove(1))}>
          <ChevronRight size={22} />
        </IconButton>
      ) : null}
      <span className="lightbox__count">
        {index + 1} / {images.length}
      </span>
    </div>,
    document.body
  );
}

// Tap the left/right side to flip through photos, like stories. Bars on top show where you are.
export default function PhotoGallery({ images = [], name, variant = "hero", children }) {
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState(null);
  const count = images.length;

  useEffect(() => setIndex(0), [images.join("|")]); // reset when the person changes

  const move = (step) => setIndex((i) => (i + step + count) % count);

  const onClick = (e) => {
    if (count < 2) return;
    const rect = e.currentTarget.getBoundingClientRect();
    move(e.clientX - rect.left < rect.width / 2 ? -1 : 1);
  };

  return (
    <div className={`gallery gallery--${variant}`}>
      <div
        className="gallery__stage"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") move(1);
          if (e.key === "ArrowLeft") move(-1);
        }}
        tabIndex={count > 1 ? 0 : -1}
        role={count > 1 ? "button" : undefined}
        aria-label={count > 1 ? `Photo ${index + 1} of ${count}. Tap the sides to switch.` : undefined}
      >
        {count ? (
          images.map((src, i) => (
            <img key={src + i} src={src} alt={i === index ? `${name || "Profile"} photo ${i + 1}` : ""} className={i === index ? "is-current" : ""} draggable="false" />
          ))
        ) : (
          <span className="gallery__fallback">{initials(name)}</span>
        )}

        {count > 1 ? (
          <div className="gallery__bars" aria-hidden="true">
            {images.map((_, i) => (
              <span key={i} className={i < index ? "is-seen" : i === index ? "is-current" : ""} />
            ))}
          </div>
        ) : null}

        {count ? (
          <IconButton
            label="View full size"
            variant="glass"
            size="sm"
            className="gallery__expand"
            onClick={(e) => {
              e.stopPropagation();
              setViewer(index);
            }}
          >
            <Expand size={16} />
          </IconButton>
        ) : null}
        {children}
      </div>

      {variant === "hero" && count > 1 ? (
        <div className="gallery__thumbs">
          {images.map((src, i) => (
            <button key={src + i} type="button" className={`gallery__thumb ${i === index ? "is-current" : ""}`} onClick={() => setIndex(i)} aria-label={`Show photo ${i + 1}`}>
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}

      {viewer !== null ? (
        <Lightbox images={images} index={viewer} onClose={() => setViewer(null)} onMove={(s) => setViewer((v) => (v + s + count) % count)} />
      ) : null}
    </div>
  );
}
