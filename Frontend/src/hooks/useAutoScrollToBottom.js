import { useEffect } from "react";

const useAutoScrollToBottom = (ref, dependency) => {
  useEffect(() => {
    if (!ref?.current) return;

    requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [ref, dependency]);
};

export default useAutoScrollToBottom;
