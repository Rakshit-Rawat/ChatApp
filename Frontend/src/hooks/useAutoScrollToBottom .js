import { useEffect } from "react";

const useAutoScrollToBottom = (ref, dependency = []) => {
  useEffect(() => {
    if (ref?.current) {
      requestAnimationFrame(() => {
        ref.current.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, dependency);
};

export default useAutoScrollToBottom;
