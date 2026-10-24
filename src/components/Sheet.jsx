import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { IconButton } from "./ui";

// Bottom sheet on phones, centred panel on larger screens. Esc / backdrop closes it.
export default function Sheet({ open, onClose, title, children, className = "" }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="sheet-root" role="dialog" aria-modal="true" aria-label={title}>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className={`sheet ${className}`.trim()}>
        <div className="sheet__handle" aria-hidden="true" />
        <IconButton label="Close" variant="glass" className="sheet__close" onClick={onClose}>
          <X size={20} />
        </IconButton>
        <div className="sheet__body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
