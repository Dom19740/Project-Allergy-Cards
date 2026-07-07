"use client";

import { useLayoutEffect, useRef } from 'react';

/**
 * Scales content down (via CSS transform) so it fits within its container's
 * height instead of being clipped by overflow-hidden. Used for fixed-length
 * legal/safety text that must stay fully readable on short screens without
 * a scrollbar.
 */
export function useShrinkToFit<C extends HTMLElement, T extends HTMLElement>(minScale = 0.6) {
  const containerRef = useRef<C>(null);
  const contentRef = useRef<T>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    content.style.transformOrigin = 'top center';

    const fit = () => {
      content.style.transform = 'scale(1)';
      const naturalHeight = content.scrollHeight;
      const availableHeight = container.clientHeight;
      const scale = naturalHeight > availableHeight
        ? Math.max(minScale, availableHeight / naturalHeight)
        : 1;
      content.style.transform = scale < 1 ? `scale(${scale})` : '';
    };

    fit();

    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [minScale]);

  return { containerRef, contentRef };
}
