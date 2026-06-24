"use client";

import { useEffect } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md transform bg-white shadow-xl transition-transform duration-200 dark:bg-zinc-900 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
