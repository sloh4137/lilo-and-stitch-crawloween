"use client";

import { useRef, type ComponentProps, type PointerEvent } from "react";
import { animated } from "@react-spring/web";

import useBoop, { BoopProps } from "@/hooks/useBoop";

export type AnimatedButtonProps = ComponentProps<"button"> & {
  boopProps: BoopProps;
};

export default function AnimatedButton({
  boopProps,
  disabled,
  style,
  ...rest
}: AnimatedButtonProps) {
  const [boopStyles, trigger] = useBoop({ ...boopProps, disabled });
  const isInside = useRef(false);

  // The span's box is the button's untransformed size, but the transformed
  // button still counts as hovering the span when it grows past that box.
  // Only trigger when the pointer crosses into the span's own bounds, so
  // the animation can't re-trigger itself at the edges.
  function handlePointerMove(event: PointerEvent<HTMLSpanElement>) {
    // Touch has no hover, and moving a finger here usually means scrolling.
    if (event.pointerType === "touch") {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (inside && !isInside.current) {
      trigger();
    }
    isInside.current = inside;
  }

  return (
    <span
      className="inline-flex w-fit"
      onPointerMove={handlePointerMove}
      onPointerDown={(event) => {
        // Boop on press instead, as tap feedback.
        if (event.pointerType === "touch") {
          trigger();
        }
      }}
      onPointerLeave={() => {
        isInside.current = false;
      }}
    >
      <animated.button
        style={{ ...style, ...boopStyles }}
        disabled={disabled}
        {...rest}
      />
    </span>
  );
}
