import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface UiApi {
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
}

const UiContext = createContext<UiApi | null>(null);

export function useUi() {
  const value = useContext(UiContext);
  if (!value) {
    throw new Error("UI provider is missing");
  }
  return value;
}

export function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

/** Owns the shell's dialog and drawer state plus the global ⌘K / C shortcuts. */
export function UiProvider({ children }: { children: ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const ui = useMemo(
    () => ({
      commandOpen,
      createOpen,
      navOpen,
      setCommandOpen,
      setCreateOpen,
      setNavOpen,
    }),
    [commandOpen, createOpen, navOpen]
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
        return;
      }
      if (
        isTyping(event.target) ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }
      if (event.key === "c") {
        event.preventDefault();
        setCreateOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <UiContext.Provider value={ui}>{children}</UiContext.Provider>;
}
