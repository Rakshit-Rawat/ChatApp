import { useRef } from "react";

import ChatHeader from "../components/messenger/ChatHeader";
import ChatList from "../components/messenger/ChatList";
import DeleteConfirmationModal from "../components/messenger/DeleteConfirmationModal";
import MessageInput from "../components/messenger/MessageInput";
import MessageList from "../components/messenger/MessageList";
import ProfileSection from "../components/messenger/ProfileSection";
import SearchSection from "../components/messenger/SearchSection";
import EmptyState from "../components/ui/EmptyState";
import useAuthRedirect from "../hooks/useAuthRedirect";
import useAutoScrollToBottom from "../hooks/useAutoScrollToBottom";
import { useAuthUser, useLogout } from "../stores/authStore";
import {
  useMessages,
  useSelectedChat,
  useShowDeleteConfirmation,
} from "../stores/chatStore";
import { useSocket } from "../stores/socketStore";

const MessengerLayout = () => {
  const user = useAuthUser();
  const logout = useLogout();
  const socket = useSocket();
  const messages = useMessages();
  const selectedChat = useSelectedChat();
  const showDeleteConfirmation = useShowDeleteConfirmation();
  const messagesEndRef = useRef(null);

  useAutoScrollToBottom(messagesEndRef, messages);
  useAuthRedirect(user);

  const handleLogout = async () => {
    if (socket && user?.username) {
      socket.emit("user-disconnected", user.username);
    }

    await logout();
  };

  return (
    <div className="flex h-screen">
      <aside className="w-[400px] border-r bg-white flex flex-col">
        <ProfileSection user={user} handleLogout={handleLogout} />
        <SearchSection />
        <ChatList />
      </aside>

      <main className="flex-1 flex flex-col bg-gray-50 min-w-0">
        {selectedChat ? (
          <>
            <ChatHeader />
            <MessageList messagesEndRef={messagesEndRef} />
            <MessageInput />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState />
          </div>
        )}

        {showDeleteConfirmation && <DeleteConfirmationModal />}
      </main>
    </div>
  );
};

export default MessengerLayout;
