import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { axiosInstance } from "../../../constants/axiosInstance";
import { useGlobalSocket } from "../../context/socketContext";

const Sidebar = ({ onCreateGroup, onSelectGroup, groupCreatedTrigger }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const socket = useGlobalSocket();

  const fetchUserGroups = async () => {
    try {
      const response = await axiosInstance.get("/groups/my-groups");
      console.log(response, "responsee from fetch group");
      setGroups(response.data);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };

  // Function to show notification
  const showNotification = (username, status) => {
    const notification = {
      id: Date.now(),
      username,
      status,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto remove notification after 4 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 4000);
  };

  const showOnlineUsersNotification = (users) => {
    const notification = {
      id: Date.now(),
      type: 'online-users',
      users,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, notification]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    fetchUserGroups();
  }, [groupCreatedTrigger]);

  useEffect(() => {
    if (!socket) return;

    const handleGroupUpdate = (groups) => {
      setGroups(groups);
    };

    const handleLatestMessage = (data) => {
      console.log("Received latestMessageUpdate", data);

      setGroups((prevGroups) => {
        const updatedGroups = prevGroups.map((group) =>
          group._id === data.groupId
            ? { ...group, lastMessage: data.lastMessage }
            : group
        );

        updatedGroups.sort((a, b) => {
          const aTime = new Date(a.lastMessage?.timestamp || 0).getTime();
          const bTime = new Date(b.lastMessage?.timestamp || 0).getTime();
          return bTime - aTime;
        });

        return [...updatedGroups];
      });
    };

    const handleUserStatus = (data) => {
      console.log(data, "data from backenddsss");

      if (data.username && data.status) {
        showNotification(data.username, data.status);
      }
    };

    const handleNewGroup = (newGroup) => {
      fetchUserGroups();
    };

    const handleOnlineUsersList = (data) => {
      setOnlineUsers(data);
      
      // Show notification for online users
      if (data && data.length > 0) {
        showOnlineUsersNotification(data);
      }
    };

    socket.on("user-status", handleUserStatus);
    socket.on("fetchGroups", handleGroupUpdate);
    socket.on("latestMessageUpdate", handleLatestMessage);
    socket.on("groupCreated", handleNewGroup);
    socket.on('onlineUsersList', handleOnlineUsersList);

    socket.emit("getGroups");

    return () => {
      socket.off("fetchGroups", handleGroupUpdate);
      socket.off("latestMessageUpdate", handleLatestMessage);
      socket.off("user-status", handleUserStatus);
      socket.off("groupCreated", handleNewGroup);
      socket.off('onlineUsersList', handleOnlineUsersList);
    };
  }, [socket]);

  const handleSelectGroup = (groupId) => {
    setSelectedGroupId(groupId);
    onSelectGroup(groupId);
  };

  return (
    <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm relative">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border 
              transform transition-all duration-300 ease-in-out
              animate-in slide-in-from-top-2
              ${
                notification.type === 'online-users'
                  ? "bg-blue-50 border-blue-200 text-blue-800"
                  : notification.status === "online"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }
            `}
          >
            <div
              className={`
                w-3 h-3 rounded-full flex-shrink-0
                ${
                  notification.type === 'online-users'
                    ? "bg-green-700"
                    : notification.status === "online"
                    ? "bg-green-500"
                    : "bg-red-500"
                }
              `}
            /> 

            <div className="flex-1 min-w-0">
              {notification.type === 'online-users' ? (
                <div> 
                  <p className="text-sm font-medium text-green-700">
                    Online Users ({notification.users.length})
                  </p>
                  <div className="text-xs text-green-700 mt-1">
                    {notification.users.map((user, index) => (
                      <span key={user.userId}>
                        {user.username}
                        {index < notification.users.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium">
                  <span className="font-semibold">{notification.username}</span>
                  {" is "}
                  <span
                    className={`
                    ${
                      notification.status === "online"
                        ? "text-green-700"
                        : "text-red-700"
                    }
                  `}
                  >
                    {notification.status}
                  </span>
                </p>
              )}
            </div>

            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Messages</h2>
        <button
          className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 font-medium shadow-sm"
          onClick={onCreateGroup}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
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
                    ${
                      selectedGroupId === group._id
                        ? "bg-blue-50 border-blue-200 shadow-sm"
                        : "hover:border-gray-100"
                    }
                  `}
                  onClick={() => handleSelectGroup(group._id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm
                      ${
                        selectedGroupId === group._id
                          ? "bg-blue-600"
                          : "bg-gray-400 group-hover:bg-gray-500"
                      }
                      transition-colors duration-200
                    `}
                    >
                      {group.name ? group.name.charAt(0).toUpperCase() : "G"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`
                          font-medium truncate text-sm
                          ${
                            selectedGroupId === group._id
                              ? "text-blue-900"
                              : "text-gray-900"
                          }
                        `}
                        >
                          {group.name}
                        </h4>
                        <span className="text-xs text-gray-500"></span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {group.lastMessage?.content ||
                          " Tap to start conversation"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2m-3-3a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2V7z"
                  />
                </svg>
              </div>
              <h3 className="text-gray-600 font-medium text-sm mb-1">
                No groups yet
              </h3>
              <p className="text-gray-500 text-xs">
                Create your first group to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;