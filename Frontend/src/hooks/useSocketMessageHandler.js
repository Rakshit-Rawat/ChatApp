import { useEffect } from "react";

const useSocketMessageHandler = ({
  socket,
  user,
  selectedChat,
  setMessages,
  setChats,
  setParticipantStatus,
}) => {
  useEffect(() => {
    if (!socket || !user?.username) return;

    console.log("Connecting socket with user:", user.username);

    socket.on("receive-message", (messageData) => {
      setMessages((prev) => [...prev, messageData]);

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === messageData.conversationId
            ? {
                ...chat,
                lastMessage: messageData.content,
                time: new Date(messageData.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }),
              }
            : chat
        )
      );
    });

    socket.on("status-response", ({ participantUsername, status }) => {
      console.log(
        `Status response received: ${participantUsername} is ${status}`
      );
      if (selectedChat && participantUsername === selectedChat.name) {
        setParticipantStatus(status);
      }
    });

    return () => {
      socket.off("receive-message");
      socket.off("status-response");
    };
  }, [socket, user, selectedChat]);
};

export default useSocketMessageHandler;
