import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import axios from "axios";

import ProfileSection from "../components/messenger/ProfileSection";
import SearchSection from "../components/messenger/SearchSection";
import ChatList from "../components/messenger/ChatList";
import MessageInput from "../components/messenger/MessageInput";
import DeleteConfirmationModal from "../components/messenger/DeleteConfirmationModal";
import MessageList from "../components/messenger/MessageList";
import ChatHeader from "../components/messenger/ChatHeader";
import EmptyState from "../components/ui/EmptyState";

const MessengerLayout = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [participantStatus, setParticipantStatus] = useState("offline");
  const [chatheaderHeight, setChatHeaderHeight] = useState(0);
  const [loadingChats, setLoadingChats] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [refreshChats, setRefreshChats] = useState(false);

  const { user, setUser, logout } = useAuth();
  const socket = useSocket();

  const chatHeaderRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chatHeaderRef.current) {
      setChatHeaderHeight(chatHeaderRef.current.offsetHeight);
    }
  }, [chatHeaderRef]);

  useEffect(() => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
    }
  }, [user]);

  useEffect(() => {
    if (!socket || !user?.username) return;

    console.log("Connecting socket with user:", user.username);

    socket.on("receive-message", (messageData) => {
      setMessages((prev) => [...prev, messageData]);

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === messageData.conversationId) {
            return {
              ...chat,
              lastMessage: messageData.content,
              time: new Date(messageData.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
            };
          }
          return chat;
        })
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

  useEffect(() => {
    if (!socket) return;

    // Listen for status updates of any user
    socket.on("user-status-update", ({ username, status }) => {
      console.log(`Status update received: ${username} is now ${status}`);

      // If this user is the one we're currently chatting with, update their status
      if (selectedChat && selectedChat.name === username) {
        setParticipantStatus(status);
      }

      // Also update the status in the chat list if needed
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.name === username ? { ...chat, status } : chat
        )
      );
    });

    return () => socket.off("user-status-update");
  }, [socket, selectedChat]);

  const handleChatSelect = async (chat) => {
    setSelectedChat((prevChat) => ({
      ...chat,
      user: prevChat?.user || user,
    }));

    setMessagesLoading(true);

    socket.emit("check-status", { participantUsername: chat.name });

    try {
      const response = await axios.get(
        `https://chatapp-oq5w.onrender.com/api/messages/${chat.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user?.username) return;

    const otherParticipant = selectedChat.participants.find(
      (p) => p.username !== user.username
    );

    if (!otherParticipant) {
      console.error("No other participant found");
      return;
    }

    const timestamp = new Date();
    const isoTimestamp = timestamp.toISOString();
    const formattedTime = timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const messageData = {
      conversationId: selectedChat.id,
      senderId: user.id,
      senderUsername: user.username,
      receiverId: otherParticipant._id,
      receiverUsername: otherParticipant.username,
      content: newMessage,
      timestamp: isoTimestamp,
    };

    const tempMessage = {
      ...messageData,
      _id: `temp-${Date.now()}`,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const { data: savedMessage } = await axios.post(
        "https://chatapp-oq5w.onrender.com/api/messages",
        messageData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      socket.emit("send-message", {
        conversationId: selectedChat.id,
        senderId: user.id,
        senderUsername: user.username,
        receiverId: otherParticipant._id,
        receiverUsername: otherParticipant.username,
        message: newMessage,
        timestamp: isoTimestamp,
      });

      await axios.patch(
        `https://chatapp-oq5w.onrender.com/api/conversation/${selectedChat.id}`,
        {
          lastMessage: {
            content: newMessage,
            senderId: user.id,
            senderUsername: user.username,
            timestamp: isoTimestamp,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempMessage._id ? savedMessage : msg))
      );

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                lastMessage: newMessage,
                time: formattedTime,
              }
            : chat
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
    }
  };

  const handleLogout = async () => {
    if (socket) {
      socket.emit("user-disconnected", user?.username);
    }
    setUser(null);
    localStorage.removeItem("authToken");
    await logout();
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessageIds((prevSelected) => {
      if (prevSelected.includes(messageId)) {
        return prevSelected.filter((id) => id !== messageId);
      } else {
        return [...prevSelected, messageId];
      }
    });
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedMessageIds([]);
  };

  // Trigger the confirmation modal
  const handleDeleteMessages = () => {
    if (selectedMessageIds.length > 0) {
      setShowDeleteConfirmation(true);
    }
  };

  // Confirm and execute deletion
  
  const confirmDeleteMessages = async () => {
    if (selectedMessageIds.length === 0) return;

    try {
      await deleteMessagesApi(selectedMessageIds);

      // Remove the messages from the UI state
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => !selectedMessageIds.includes(msg._id))
      );

      // Update chat list with the new last message after deletion
      if (selectedChat) {
        // Find the most recent message that wasn't deleted
        const remainingMessages = messages.filter(
          (msg) => !selectedMessageIds.includes(msg._id)
        );

        // Sort messages by timestamp to get the latest one
        const sortedMessages = [...remainingMessages].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        const newLastMessage =
          sortedMessages.length > 0
            ? sortedMessages[0]
            : { content: "No messages", timestamp: new Date() };

        // Update the chats array with the new last message
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

        // Also update the conversation in the backend with the new last message
        if (sortedMessages.length > 0) {
          const latestMsg = sortedMessages[0];
          await axios.patch(
            `https://chatapp-oq5w.onrender.com/api/conversation/${selectedChat.id}`,
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
      }

      // Clear selection and close modal
      setSelectedMessageIds([]);
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error("Error while deleting messages:", error);
      // Handle error (maybe show an error notification)
    }
  };

  // Improved deleteMessagesApi function
  const deleteMessagesApi = async (messageIds) => {
    try {
      const response = await axios.delete(
        "https://chatapp-oq5w.onrender.com/api/messages/bulk-delete",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          data: { messageIds }, // Use data property for DELETE request body
        }
      );

      if (!response.ok && response.status !== 200) {
        throw new Error("Failed to delete messages");
      }

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
        <SearchSection setChats={setChats} user={user} />
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