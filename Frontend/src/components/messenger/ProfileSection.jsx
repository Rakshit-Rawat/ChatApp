import React,{useState} from 'react'
import { LogOut, Settings, Edit, Bell } from "lucide-react";


const ProfileSection = ({user,handleLogout}) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  return (
  <div className="p-5 border-b relative">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
              style={{ background: user?.avatar?.color }}
            >
              {user?.avatar?.initials}
            </div>
            <div className="ml-3 flex-1">
              <div className="font-medium">{user?.username}</div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Settings className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute top-20 left-4 right-4 bg-white border rounded-lg shadow-lg z-10">
              <div className="p-[14px] border-b">
                <div className="font-medium">My Profile</div>
                <div className="text-sm text-gray-500">{user?.email}</div>
              </div>
              <div className="p-2">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded flex items-center">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded flex items-center">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </button>
                <button
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
  )
}

export default ProfileSection