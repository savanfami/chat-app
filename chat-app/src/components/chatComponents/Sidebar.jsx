import axios from "axios";
import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../constants/axiosInstance";

const Sidebar = ({ onCreateGroup, onSelectGroup,groupCreatedTrigger }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const fetchUserGroups = async () => {
    try {
      const response = await axiosInstance.get("/groups/my-groups");
      setGroups(response.data);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };

  useEffect(() => {
    fetchUserGroups()
  }, [groupCreatedTrigger]);

  const handleSelectGroup = (groupId) => {
    setSelectedGroupId(groupId);
    onSelectGroup(groupId);
  };

  return (
    <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Messages</h2>
        <button
          className="w-full bg-blue-600  text-white px-4 py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 font-medium shadow-sm"
          onClick={onCreateGroup}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Group
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {groups.length > 0 ? (
            <div className="space-y-1">
              {groups.map((group) => (
                <div
                  key={group._id}
                  className={`
                    cursor-pointer p-3 rounded-lg transition-all duration-200 
                    group hover:bg-gray-50 border border-transparent
                    ${selectedGroupId === group._id 
                      ? 'bg-blue-50 border-blue-200 shadow-sm' 
                      : 'hover:border-gray-100'
                    }
                  `}
                  onClick={() => handleSelectGroup(group._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm
                      ${selectedGroupId === group._id ? 'bg-blue-600' : 'bg-gray-400 group-hover:bg-gray-500'}
                      transition-colors duration-200
                    `}>
                      {group.name ? group.name.charAt(0).toUpperCase() : 'G'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`
                          font-medium truncate text-sm
                          ${selectedGroupId === group._id ? 'text-blue-900' : 'text-gray-900'}
                        `}>
                          {group.name}
                        </h4>
                        <span className="text-xs text-gray-500">
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        Tap to open conversation
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2m-3-3a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2V7z" />
                </svg>
              </div>
              <h3 className="text-gray-600 font-medium text-sm mb-1">No groups yet</h3>
              <p className="text-gray-500 text-xs">Create your first group to start chatting</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Sidebar;