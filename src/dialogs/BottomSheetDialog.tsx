"use client";

import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { useNativeDialogSync } from "./useNativeDialogSync";

interface BottomSheetDialogProps
  extends Omit<ComponentPropsWithoutRef<"dialog">, "open"> {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** Bottom-anchored native `<dialog>` sheet driven by useNativeDialogSync. */
export const BottomSheetDialog = ({
  open,
  onClose,
  children,
  className,
  ...props
}: BottomSheetDialogProps) => {
  const { dialogRef, handleNativeClose } = useNativeDialogSync(open, onClose);

  return (
    <dialog
      ref={dialogRef}
      onClose={handleNativeClose}
      className={cn(
        "fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none translate-none overflow-y-auto rounded-t-2xl border border-[var(--af-border)] bg-[var(--af-surface)] text-[var(--af-foreground)] p-6 shadow-xl backdrop:bg-black/40",
        "max-h-[min(90vh,100dvh)]",
        className,
      )}
      {...props}
    >
      {children}
    </dialog>
  );
};
