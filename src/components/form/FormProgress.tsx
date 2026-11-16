"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getUiStrings } from "@/lib/i18n/translations";
import { useLanguageStore } from "@/store/language-store";

interface FormProgressProps {
  steps: string[];
  currentIndex: number;
  onSelectStep?: (index: number) => void;
  maxReachableIndex: number;
}

export function FormProgress({
  steps,
  currentIndex,
  onSelectStep,
  maxReachableIndex,
}: FormProgressProps) {
  const language = useLanguageStore((s) => s.language);
  const t = getUiStrings(language);

  const total = steps.length;
  const currentStepNumber = Math.min(currentIndex + 1, total);
  const percent = total > 0 ? Math.round((currentStepNumber / total) * 100) : 0;
  const currentName = steps[currentIndex] ?? "";

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLButtonElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll boundary to toggle left/right arrows & edge indicators
  const checkScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScrollState();
    el.addEventListener("scroll", checkScrollState, { passive: true });
    window.addEventListener("resize", checkScrollState);
    return () => {
      el.removeEventListener("scroll", checkScrollState);
      window.removeEventListener("resize", checkScrollState);
    };
  }, [checkScrollState, steps]);

  // Smoothly center the active step in the scrollable viewport on step change
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
    const timer = setTimeout(checkScrollState, 350);
    return () => clearTimeout(timer);
  }, [currentIndex, checkScrollState]);

  const handleScrollBy = (delta: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  // Mouse drag-to-scroll implementation
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isMouseDownRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    startScrollLeftRef.current = el.scrollLeft;
    hasDraggedRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    el.scrollLeft = startScrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
  };

  // Mouse wheel horizontal scrolling
  const handleWheel = (e: React.WheelEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (el.scrollWidth > el.clientWidth) {
      el.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)]">
      {/* Step Header info */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium text-slate-700">
        <span className="text-base font-bold tracking-tight text-slate-900">
          {t.progress.stepOf(currentStepNumber, total, currentName)}
        </span>
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200/80">
          {t.progress.percent(percent)}
        </span>
      </div>

      {/* Main Progress Bar */}
      <div className="relative mt-3.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 transition-all duration-300 shadow-xs"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Horizontally Scrollable Step Navigation */}
      <div className="relative mt-3.5">
        {/* Left Scroll Arrow */}
        {canScrollLeft && (
          <div className="absolute -left-1 top-1/2 z-20 -translate-y-1/2 flex items-center">
            <button
              type="button"
              onClick={() => handleScrollBy(-180)}
              aria-label="Scroll left"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white/95 text-slate-700 shadow-md backdrop-blur-xs transition hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden"
            >
              <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Left Gradient Fade Mask */}
        {canScrollLeft && (
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-white to-transparent"
            aria-hidden="true"
          />
        )}

        {/* Scrollable Container with Pills */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onWheel={handleWheel}
          className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 scroll-smooth touch-pan-x cursor-grab active:cursor-grabbing select-none scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 scrollbar-track-transparent"
        >
          {steps.map((stepName, index) => {
            const isCurrent = index === currentIndex;
            const isDone = index < currentIndex;
            const isClickable = Boolean(onSelectStep && index <= maxReachableIndex);

            return (
              <button
                key={`${stepName}-${index}`}
                ref={isCurrent ? activeStepRef : null}
                type="button"
                disabled={!isClickable}
                onClick={() => {
                  if (hasDraggedRef.current) return;
                  if (isClickable) onSelectStep?.(index);
                }}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  isCurrent
                    ? "border-blue-700 bg-blue-700 text-white shadow-xs ring-2 ring-blue-500/25"
                    : isDone
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : "border-slate-200/80 bg-slate-50 text-slate-500 hover:bg-slate-100"
                } ${isClickable ? "cursor-pointer" : "cursor-default opacity-80"}`}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
                ) : (
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                      isCurrent
                        ? "bg-white/25 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {index + 1}
                  </span>
                )}
                <span>{stepName}</span>
              </button>
            );
          })}
        </div>

        {/* Right Gradient Fade Mask */}
        {canScrollRight && (
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-white to-transparent"
            aria-hidden="true"
          />
        )}

        {/* Right Scroll Arrow */}
        {canScrollRight && (
          <div className="absolute -right-1 top-1/2 z-20 -translate-y-1/2 flex items-center">
            <button
              type="button"
              onClick={() => handleScrollBy(180)}
              aria-label="Scroll right"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white/95 text-slate-700 shadow-md backdrop-blur-xs transition hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden"
            >
              <ChevronRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
