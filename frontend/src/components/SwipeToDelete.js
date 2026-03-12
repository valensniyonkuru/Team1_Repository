import React, { useRef, useState, useCallback } from "react";
import { TrashIcon } from "./icons";

const DELETE_PANEL_WIDTH = 80; // px
const SNAP_THRESHOLD = 40;     // px drag required to snap open


const SwipeToDelete = ({ children, onDelete, disabled = false, label = "Delete" }) => {
  const [offset, setOffset] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [animate, setAnimate] = useState(false);

  const dragging = useRef(false);
  const startX = useRef(0);
  const baseOffset = useRef(0);
  const liveOffset = useRef(0);

  const snapTo = useCallback((target) => {
    setAnimate(true);
    setOffset(target);
    liveOffset.current = target;
    setIsOpen(target > 0);
    setTimeout(() => setAnimate(false), 240);
  }, []);

  const onPointerDown = useCallback(
    (e) => {
      if (disabled) return;
      // Only respond to left mouse button or touch/pen
      if (e.pointerType === "mouse" && e.button !== 0) return;

      dragging.current = true;
      startX.current = e.clientX;
      baseOffset.current = liveOffset.current;

      const onMove = (ev) => {
        if (!dragging.current) return;
        // Prevent scroll interference during horizontal drag
        const dx = startX.current - ev.clientX;
        if (Math.abs(dx) > 5) ev.preventDefault();
        const next = Math.max(0, Math.min(DELETE_PANEL_WIDTH, baseOffset.current + dx));
        setOffset(next);
        liveOffset.current = next;
      };

      const onUp = () => {
        if (!dragging.current) return;
        dragging.current = false;
        snapTo(liveOffset.current >= SNAP_THRESHOLD ? DELETE_PANEL_WIDTH : 0);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };

      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [disabled, snapTo]
  );

  const handleDelete = () => {
    snapTo(0);
    onDelete?.();
  };

  return (
    <div className="relative overflow-hidden select-none">
      {/* ── Delete action panel (sits behind content on the right) ── */}
      <div
        className="absolute inset-y-0 right-0 flex items-stretch rounded-lg bg-[#dc2626]"
        style={{ width: DELETE_PANEL_WIDTH }}
        aria-hidden={!isOpen}
      >
        <button
          onClick={handleDelete}
          tabIndex={isOpen ? 0 : -1}
          className="flex w-full flex-col items-center justify-center gap-1 text-white hover:bg-[#b91c1c] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
          aria-label={label}
        >
          <TrashIcon size={20} color="#ffffff" />
          <span className="text-[11px] font-medium font-inter leading-none">{label}</span>
        </button>
      </div>

      {/* ── Sliding content layer ── */}
      <div
        onPointerDown={onPointerDown}
        onDragStart={(e) => e.preventDefault()}
        className={animate ? "transition-transform duration-[240ms] ease-out" : undefined}
        style={{
          transform: `translateX(-${offset}px)`,
          touchAction: "pan-y",
          userSelect: "none",
          cursor: disabled ? undefined : "grab",
          willChange: "transform",
        }}
      >
        {children}
      </div>

      {/* ── Tap-outside backdrop to close ── */}
      {isOpen && (
        <div
          className="absolute inset-0"
          style={{ right: DELETE_PANEL_WIDTH }}
          onClick={() => snapTo(0)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default SwipeToDelete;
