"use client";

import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { useNativeDialogSync } from "./useNativeDialogSync";

interface ModalDialogProps
  extends Omit<ComponentPropsWithoutRef<"dialog">, "open"> {
  open: boolean;
  onClose: () => void;
  /** "fullscreen" fills the viewport and owns its own padding. */
  variant?: "centered" | "fullscreen";
  children: ReactNode;
}

// Geometry lives here rather than at call sites because cn() is a plain join,
// so a className passed in cannot override these positioning utilities.
const VARIANT_CLASSES = {
  centered:
    "fixed top-1/2 left-1/2 max-h-[calc(100vh-2rem)] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[var(--af-border)] p-6 shadow-xl",
  fullscreen:
    "fixed inset-0 h-full max-h-none w-full max-w-none overflow-hidden p-0",
} as const;

/**
 * Native `<dialog>` modal — centered panel by default, or filling the viewport.
 * Tailwind preflight resets the browser's default centering, so each variant
 * pins itself; open/close syncing is handled by useNativeDialogSync.
 */
export const ModalDialog = ({
  open,
  onClose,
  variant = "centered",
  children,
  className,
  ...props
}: ModalDialogProps) => {
  const { dialogRef, handleNativeClose } = useNativeDialogSync(open, onClose);

  return (
    <dialog
      ref={dialogRef}
      onClose={handleNativeClose}
      className={cn(
        "m-0 bg-[var(--af-surface)] text-[var(--af-foreground)] backdrop:bg-black/40",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {children}
    </dialog>
  );
};
