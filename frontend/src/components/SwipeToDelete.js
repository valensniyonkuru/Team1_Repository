import React, { useRef, useState, useCallback } from "react";
import { TrashIcon } from "./icons";

const DELETE_PANEL_WIDTH = 80; // px
const SNAP_THRESHOLD = 40;     // px drag required to snap open


const SwipeToDelete = ({ children, onDelete, disabled = false, label = "Delete" }) => {
  const [offset, setOffset] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Refs let callbacks read current values without stale-closure issues
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
      dragging.current = true;
      startX.current = e.clientX;
      baseOffset.current = liveOffset.current;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [disabled]
  );

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    const next = Math.max(
      0,
      Math.min(DELETE_PANEL_WIDTH, baseOffset.current + (e.clientX - startX.current))
    );
    setOffset(next);
    liveOffset.current = next;
  }, []);

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    snapTo(liveOffset.current >= SNAP_THRESHOLD ? DELETE_PANEL_WIDTH : 0);
  }, [snapTo]);

  const handleDelete = () => {
    snapTo(0);
    onDelete?.();
  };

  return (
    <div className="relative overflow-hidden select-none">
      {/* ── Delete action panel (sits behind content on the left) ── */}
      <div
        className="absolute inset-y-0 left-0 flex items-stretch bg-[#dc2626]"
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
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={animate ? "transition-transform duration-[240ms] ease-out" : undefined}
        style={{
          transform: `translateX(${offset}px)`,
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
          style={{ left: DELETE_PANEL_WIDTH }}
          onClick={() => snapTo(0)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default SwipeToDelete;
