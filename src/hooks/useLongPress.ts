import { useRef, useCallback } from "react";

type UseLongPressOptions = {
  delay?: number;
  onLongPress: () => void;
  vibrate?: boolean;
};

export function useLongPress({
  delay = 500,
  onLongPress,
}: UseLongPressOptions) {
  const timerRef = useRef<number | null>(null);
  const triggeredRef = useRef(false);

  const start = useCallback(() => {
    triggeredRef.current = false;

    timerRef.current = setTimeout(() => {
      triggeredRef.current = true;

      onLongPress();
    }, delay);
  }, [delay, onLongPress]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    onPointerDown: start,
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    triggeredRef,
  };
}
