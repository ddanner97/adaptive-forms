"use client";

import { useEffect, useRef } from "react";

let bodyScrollLockCount = 0;
let lockedScrollY = 0;
let previousBodyOverflow = "";
let previousBodyPosition = "";
let previousBodyTop = "";
let previousBodyWidth = "";

/** Prevents the page behind open dialogs from scrolling. Ref-counted so nested
 * dialogs don't unlock the body when only the inner one closes. */
function lockBodyScroll() {
  if (bodyScrollLockCount === 0) {
    lockedScrollY = window.scrollY;
    previousBodyOverflow = document.body.style.overflow;
    previousBodyPosition = document.body.style.position;
    previousBodyTop = document.body.style.top;
    previousBodyWidth = document.body.style.width;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.width = "100%";
  }
  bodyScrollLockCount += 1;
}

function unlockBodyScroll() {
  if (bodyScrollLockCount === 0) return;
  bodyScrollLockCount -= 1;
  if (bodyScrollLockCount > 0) return;

  document.body.style.overflow = previousBodyOverflow;
  document.body.style.position = previousBodyPosition;
  document.body.style.top = previousBodyTop;
  document.body.style.width = previousBodyWidth;
  window.scrollTo(0, lockedScrollY);
}

/**
 * Syncs a native `<dialog>` to a controlled `open` prop via showModal()/close(),
 * and tracks user-initiated dismissals (Escape / backdrop click) so a still-true
 * `open` prop does not immediately reopen the dialog before the parent
 * re-renders. Spread `dialogRef` and `handleNativeClose` onto the element.
 */
export const useNativeDialogSync = (open: boolean, onClose: () => void) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const userClosedRef = useRef(false);
  const programmaticCloseRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!userClosedRef.current && !dialog.open) dialog.showModal();
      return;
    }

    userClosedRef.current = false;
    if (dialog.open) {
      programmaticCloseRef.current = true;
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [open]);

  const handleNativeClose = () => {
    if (programmaticCloseRef.current) {
      programmaticCloseRef.current = false;
      return;
    }
    userClosedRef.current = true;
    onClose();
  };

  return { dialogRef, handleNativeClose };
};
