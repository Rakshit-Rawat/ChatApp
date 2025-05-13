import { useEffect, useRef,useState } from "react";

const useChatHeaderHeight = () => {
     const [chatheaderHeight, setChatHeaderHeight] = useState(0);
  const chatHeaderRef = useRef(null);

  useEffect(() => {
    if (chatHeaderRef.current) {
      setChatHeaderHeight(chatHeaderRef.current.offsetHeight);
    }
  }, [chatHeaderRef]);
  return {chatHeaderRef,chatheaderHeight};
};

export default useChatHeaderHeight