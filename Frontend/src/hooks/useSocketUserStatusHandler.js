import { useEffect } from "react";
import { useSocket } from "@/stores/socketStore";

const useSocketUserStatusHandler = ({
  
  selectedChat,
  setChats,
  setParticipantStatus,
}) => {

  const socket=useSocket()  
  useEffect(() => {
    if (!socket) return;

    socket.on("user-status-update", ({ username, status }) => {
      console.log(`Status update received: ${username} is now ${status}`);

      if (selectedChat && selectedChat.name === username) {
        setParticipantStatus(status);
      }

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.name === username ? { ...chat, status } : chat
        )
      );
    });

    return () => socket.off("user-status-update");
  }, [socket, selectedChat]);
};

export default useSocketUserStatusHandler;
