"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A single floating scroll-nav button that toggles between "scroll to
 * bottom" and "scroll to top" depending on where the user currently is —
 * only one direction is ever shown at a time:
 *   - Near the top of the page  → shows a DOWN arrow (jump to bottom)
 *   - Scrolled down the page    → shows an UP arrow (jump back to top)
 */
export default function ScrollToTopButton({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    // The dashboard layout scrolls its own <main>, while public pages
    // (landing/auth) scroll the window — so we listen to both.
    const mainEl = document.querySelector("main");
    const target: Window | Element = mainEl && mainEl.scrollHeight > mainEl.clientHeight ? mainEl : window;

    const getScrollTop = () =>
      target === window ? window.scrollY : (target as Element).scrollTop;

    const THRESHOLD = 300;

    const isScrollable = () => {
      const el = mainEl && mainEl.scrollHeight > mainEl.clientHeight ? mainEl : null;
      return el
        ? el.scrollHeight > el.clientHeight + 10
        : document.documentElement.scrollHeight > document.documentElement.clientHeight + 10;
    };

    const onScroll = () => {
      const top = getScrollTop();
      setVisible(isScrollable());
      setAtTop(top <= THRESHOLD);
    };

    target.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => target.removeEventListener("scroll", onScroll);
  }, []);

  const getTarget = () => {
    const mainEl = document.querySelector("main");
    return mainEl && mainEl.scrollHeight > mainEl.clientHeight ? mainEl : null;
  };

  const scrollToTop = () => {
    const el = getTarget();
    if (el) el.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    const el = getTarget();
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    else window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={atTop ? scrollToBottom : scrollToTop}
      title={atTop ? "Scroll to bottom" : "Back to top"}
      aria-label={atTop ? "Scroll to bottom" : "Scroll to top"}
      className={cn(
        "w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all duration-200 active:scale-95",
        className
      )}
    >
      {atTop ? <ArrowDown className="w-5 h-5" /> : <ArrowUp className="w-5 h-5" />}
    </button>
  );
}
