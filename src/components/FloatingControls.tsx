"use client";

import ScrollToTopButton from "./ScrollToTopButton";

export default function FloatingControls() {
  return (
    <div className="fixed bottom-24 right-5 z-40 flex flex-col items-center gap-3">
      <ScrollToTopButton />
    </div>
  );
}
