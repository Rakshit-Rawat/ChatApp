import { useState } from "react";
import { LogOut, Settings } from "lucide-react";

const ProfileSection = ({ user, handleLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className="p-5 border-b relative">
      <button
        type="button"
        className="w-full flex items-center text-left"
        onClick={() => setShowProfileMenu((visible) => !visible)}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
          style={{ background: user?.avatar?.color }}
        >
          {user?.avatar?.initials}
        </div>

        <div className="ml-3 flex-1 min-w-0">
          <div className="font-medium truncate">{user?.username}</div>
        </div>

        <span className="p-2 hover:bg-gray-100 rounded-full">
          <Settings className="w-5 h-5 text-gray-500" />
        </span>
      </button>

      {showProfileMenu && (
        <div className="absolute top-20 left-4 right-4 bg-white border rounded-lg shadow-lg z-30">
          <div className="p-3 border-b">
            <div className="font-medium">My Profile</div>
            <div className="text-sm text-gray-500 truncate">{user?.email}</div>
          </div>

          <div className="p-2">
            <button
              type="button"
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded flex items-center"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
