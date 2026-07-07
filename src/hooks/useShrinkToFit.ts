"use client";

import { useCallback, useEffect, useRef } from 'react';

/**
 * Scales content down (via CSS transform) so it fits within its container
 * instead of being clipped by overflow-hidden. Used for fixed-length
 * text (legal/safety copy, translated messages) that must stay fully
 * readable on short/narrow screens without a scrollbar.
 *
 * Uses callback refs rather than plain useRef + useLayoutEffect: callers
 * that mount the measured elements behind a conditional (e.g. a loading
 * state rendered first) would otherwise have the initial effect run once
 * against null refs and never retry once the real nodes attach - refs
 * changing doesn't re-trigger effects, only dependency changes do.
 */
export function useShrinkToFit<C extends HTMLElement, T extends HTMLElement>(minScale = 0.6) {
  const containerElRef = useRef<C | null>(null);
  const contentElRef = useRef<T | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const fit = useCallback(() => {
    const container = containerElRef.current;
    const content = contentElRef.current;
    if (!container || !content) return;

    content.style.transformOrigin = 'top center';
    content.style.transform = 'scale(1)';
    const naturalHeight = content.scrollHeight;
    const naturalWidth = content.scrollWidth;
    const availableHeight = container.clientHeight;
    const availableWidth = container.clientWidth;
    const heightScale = naturalHeight > availableHeight ? availableHeight / naturalHeight : 1;
    const widthScale = naturalWidth > availableWidth ? availableWidth / naturalWidth : 1;
    const scale = Math.max(minScale, Math.min(heightScale, widthScale, 1));
    content.style.transform = scale < 1 ? `scale(${scale})` : '';
  }, [minScale]);

  const trySetupObserver = useCallback(() => {
    const container = containerElRef.current;
    const content = contentElRef.current;

    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!container || !content) return;

    // Watch both: the container (viewport/layout changes) and the content
    // itself (text changing length, e.g. a translation swap) can each
    // invalidate the fit. Setting `transform` doesn't affect the observed
    // border-box size, so this can't loop back on its own update.
    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(container);
    resizeObserver.observe(content);
    observerRef.current = resizeObserver;
    fit();
  }, [fit]);

  const containerRef = useCallback((node: C | null) => {
    containerElRef.current = node;
    trySetupObserver();
  }, [trySetupObserver]);

  const contentRef = useCallback((node: T | null) => {
    contentElRef.current = node;
    trySetupObserver();
  }, [trySetupObserver]);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return { containerRef, contentRef };
}
