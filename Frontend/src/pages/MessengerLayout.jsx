import { useState, useRef, useCallback } from "react";
import { useAuthUser, useLogout, useSetUser } from "../stores/authStore";
import { useSocket } from "../stores/socketStore";
import axios from "axios";
import ProfileSection from "../components/messenger/ProfileSection";
import SearchSection from "../components/messenger/SearchSection";
import ChatList from "../components/messenger/ChatList";
import MessageInput from "../components/messenger/MessageInput";
import DeleteConfirmationModal from "../components/messenger/DeleteConfirmationModal";
import MessageList from "../components/messenger/MessageList";
import ChatHeader from "../components/messenger/ChatHeader";
import EmptyState from "../components/ui/EmptyState";

import useChatHeaderHeight from "../hooks/useChatHeaderHeight";
import useAutoScrollToBottom from "../hooks/useAutoScrollToBottom ";
import useAuthRedirect from "../hooks/useAuthRedirect";
import useSocketMessageHandler from "../hooks/useSocketMessageHandler";
import useSocketUserStatusHandler from "../hooks/useSocketUserStatusHandler";
import useChatHandlers from "../hooks/useChatHandlers";

const MessengerLayout = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [participantStatus, setParticipantStatus] = useState("offline");
  const [loadingChats, setLoadingChats] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [refreshChats, setRefreshChats] = useState(0);

  const user = useAuthUser();
  const logout = useLogout();
  const setUser = useSetUser();

  const socket = useSocket();

  const messagesEndRef = useRef(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Function to trigger chat refresh
  const triggerChatRefresh = useCallback(() => {
    setRefreshChats((prev) => prev + 1);
  }, []);

  //Custom Hooks
  const { chatHeaderRef, chatheaderHeight } = useChatHeaderHeight();
  useAutoScrollToBottom(messagesEndRef, [messages]);
  useAuthRedirect(user);

  useSocketMessageHandler({
    
    
    selectedChat,
    setMessages,
    setChats,
    setParticipantStatus,
  });

  useSocketUserStatusHandler({
    
    selectedChat,
    setChats,
    setParticipantStatus,
  });

  const {
    handleChatSelect,
    handleSendMessage,
    toggleMessageSelection,
    clearSelection,
    handleDeleteMessages,
  } = useChatHandlers({
    user,
    
    selectedChat,
    setMessages,
    setChats,
    setMessagesLoading,
    setSelectedChat,
    setSelectedMessageIds,
    setShowDeleteConfirmation,
    triggerChatRefresh,
  });

  const handleLogout = async () => {
    if (socket) {
      socket.emit("user-disconnected", user?.username);
    }
    setUser(null);
    localStorage.removeItem("authToken");
    await logout();
  };

  const confirmDeleteMessages = async () => {
    if (selectedMessageIds.length === 0) return;

    setShowDeleteConfirmation(false);

    try {
      const idsToDelete = [...selectedMessageIds];

      setSelectedMessageIds([]);

      setMessages((prevMessages) =>
        prevMessages.filter((msg) => !idsToDelete.includes(msg._id))
      );

      if (selectedChat) {
        const remainingMessages = messages.filter(
          (msg) => !idsToDelete.includes(msg._id)
        );

        const sortedMessages = [...remainingMessages].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        const newLastMessage =
          sortedMessages.length > 0
            ? sortedMessages[0]
            : { content: "No messages", timestamp: new Date() };

        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id === selectedChat.id) {
              return {
                ...chat,
                lastMessage: newLastMessage.content,
                time: new Date(newLastMessage.timestamp).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }
                ),
              };
            }
            return chat;
          })
        );

        await deleteMessagesApi(idsToDelete);

        if (sortedMessages.length > 0) {
          const latestMsg = sortedMessages[0];
          await axios.patch(
            `${backendUrl}/api/conversation/${selectedChat.id}`,
            {
              lastMessage: {
                content: latestMsg.content,
                senderId: latestMsg.senderId,
                senderUsername: latestMsg.senderUsername,
                timestamp: latestMsg.timestamp,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );
        }

        // Trigger chat list refresh after deletion
        triggerChatRefresh();
      } else {
        await deleteMessagesApi(idsToDelete);
      }
    } catch (error) {
      console.error("Error while deleting messages:", error);
    }
  };

  const deleteMessagesApi = async (messageIds) => {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/messages/bulk-delete`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          data: { messageIds },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error deleting messages:", error);
      throw error;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-100 border-r bg-white flex flex-col">
        {/* User Profile Section */}
        <ProfileSection user={user} handleLogout={handleLogout} />

        {/* Search Section */}
        <SearchSection
          setChats={setChats}
          user={user}
          triggerChatRefresh={triggerChatRefresh}
        />

        {/* Chat List */}
        <ChatList
          chats={chats}
          setChats={setChats}
          handleChatSelect={handleChatSelect}
          loadingChats={loadingChats}
          setLoadingChats={setLoadingChats}
          user={user}
          refreshChats={refreshChats}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedChat ? (
          <>
            {/* Chat Header for selected chat */}
            <div ref={chatHeaderRef}>
              <ChatHeader
                selectedChat={selectedChat}
                participantStatus={participantStatus}
                selectedMessageIds={selectedMessageIds}
                handleDeleteMessages={handleDeleteMessages}
                clearSelection={clearSelection}
              />
            </div>

            {/* Messages */}
            <MessageList
              user={user}
              messages={messages}
              selectedChat={selectedChat}
              messagesLoading={messagesLoading}
              selectedMessageIds={selectedMessageIds}
              toggleMessageSelection={toggleMessageSelection}
              messagesEndRef={messagesEndRef}
            />

            {/* Message Input */}
            <MessageInput
              selectedChat={selectedChat}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleSendMessage={handleSendMessage}
            />
          </>
        ) : (
          // Empty state when no chat is selected - takes full height
          <div className="flex-1 flex items-center justify-center">
            <EmptyState />
          </div>
        )}

        {/* Confirmation Modal - outside the conditional rendering */}
        {showDeleteConfirmation && (
          <DeleteConfirmationModal
            showDeleteConfirmation={showDeleteConfirmation}
            selectedMessageIds={selectedMessageIds}
            setShowDeleteConfirmation={setShowDeleteConfirmation}
            confirmDeleteMessages={confirmDeleteMessages}
          />
        )}
      </div>
    </div>
  );
};

export default MessengerLayout;
