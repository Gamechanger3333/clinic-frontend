"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScrollToTopButton({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // The dashboard layout scrolls its own <main>, while public pages
    // (landing/auth) scroll the window — so we listen to both.
    const mainEl = document.querySelector("main");
    const target: Window | Element = mainEl && mainEl.scrollHeight > mainEl.clientHeight ? mainEl : window;

    const getScrollTop = () =>
      target === window ? window.scrollY : (target as Element).scrollTop;

    const onScroll = () => setVisible(getScrollTop() > 300);

    target.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => target.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const mainEl = document.querySelector("main");
    if (mainEl && mainEl.scrollHeight > mainEl.clientHeight) {
      mainEl.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      title="Back to top"
      aria-label="Scroll to top"
      className={cn(
        "w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all duration-200 active:scale-95",
        className
      )}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
