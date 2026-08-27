"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Photograph } from "@/types";
import { ImageLightbox } from "./ImageLightbox";

interface LightboxState {
  photos: Photograph[];
  index: number;
}

interface LightboxContextValue {
  open: (photos: Photograph[], index?: number) => void;
  close: () => void;
  move: (dir: 1 | -1) => void;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState | null>(null);

  const open = useCallback((photos: Photograph[], index = 0) => {
    setState({ photos, index: Math.max(0, Math.min(index, photos.length - 1)) });
  }, []);

  const close = useCallback(() => setState(null), []);

  const move = useCallback(
    (dir: 1 | -1) => {
      setState((s) => {
        if (!s || s.photos.length === 0) return s;
        const next = (s.index + dir + s.photos.length) % s.photos.length;
        return { ...s, index: next };
      });
    },
    []
  );

  return (
    <LightboxContext.Provider value={{ open, close, move }}>
      {children}
      <ImageLightbox state={state} onClose={close} onMove={move} />
    </LightboxContext.Provider>
  );
}

export function useLightbox() {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error("useLightbox must be used inside LightboxProvider");
  return ctx;
}
