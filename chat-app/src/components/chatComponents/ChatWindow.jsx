import React, { useState, useRef, useEffect, useCallback } from "react";
import { axiosInstance } from "../../../constants/axiosInstance";
import { jwtDecode } from "jwt-decode";
import { useSocket } from "../../utils/customHooks/useSocket";
import { uploadToCloudinary } from "../../utils/common/cloudinary";

const ChatWindow = ({ groupId }) => {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const editInputRef = useRef(null);
  const token = localStorage.getItem("token");
  let currentUser = "";
  if (token) {
    const decoded = jwtDecode(token);
    currentUser = decoded.userId;
  }

  const getFileType = (file) => {
    if (!file) return null;
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video/mp4";
    return "file";
  };

  const getMediaTypeFromUrl = (url) => {
    if (!url) return null;
    const extension = url.split(".").pop().toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
    const videoExtensions = ["mp4", "mov", "avi", "wmv", "flv", "webm", "mkv"];
    if (imageExtensions.includes(extension)) return "image";
    if (videoExtensions.includes(extension)) return "video/mp4";
    return "file";
  };

  const createFilePreview = (file) => {
    const fileType = getFileType(file);
    if (fileType === "image" || fileType === "video/mp4") {
      const url = URL.createObjectURL(file);
      setFilePreview({ url, type: fileType });
    } else {
      setFilePreview(null);
    }
  };

  const handleMessageReceived = useCallback(
    (msg) => {
      console.log(msg, "msg from socket");
      const formattedMsg = {
        id: msg.id,
        sender: msg.sender.email,
        username: msg.sender.username,
        text: msg.content,
        timestamp: msg.timestamp,
        isCurrentUser: msg.sender._id === currentUser,
        image: msg.image,
        mediaUrl: msg.mediaUrl,
        isEdited: msg.edited || false,
        readBy: msg.readBy || [],
        deliveredTo: msg.deliveredTo || [],
      };
      setMessages((prev) => [...prev, formattedMsg]);
    },
    [currentUser]
  );
  const handleMessageSeenUpdate = useCallback(
    ({ groupId: seenGroupId, readBy }) => {
      console.log(readBy, "readbyyy");
      if (seenGroupId !== groupId) return;
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (!msg.readBy?.includes(readBy)) {
            return {
              ...msg,
              readBy: [...msg.readBy, readBy],
            };
          }
          return msg;
        })
      );
    },
    [groupId]
  );

  const handleMessageDeliveredUpdate = useCallback(
    ({ groupId: deliveredGroupId, deliveredTo }) => {
      if (deliveredGroupId !== groupId) return;

      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (!msg.deliveredTo?.includes(deliveredTo)) {
            return {
              ...msg,
              deliveredTo: [...(msg.deliveredTo || []), deliveredTo],
            };
          }
          return msg;
        })
      );
    },
    [groupId]
  );

  const handleMessageEdited = useCallback((updatedMsg) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === updatedMsg._id || msg.id === updatedMsg.id
          ? {
              ...msg,
              text: updatedMsg.content,
              isEdited: true,
            }
          : msg
      )
    );
    setEditingMessage(null);
    setEditText("");
  }, []);

  const { sendMessage, editMessage } = useSocket(
    groupId,
    handleMessageReceived,
    handleMessageEdited,
    handleMessageSeenUpdate,
    handleMessageDeliveredUpdate 
  );

  const fetchMessages = async () => {
    if (!groupId) return;
    try {
      const response = await axiosInstance.get(`/messages/${groupId}`);
      const formatted = response.data.map((msg) => ({
        id: msg._id,
        sender: msg.sender.email,
        username: msg.sender.username,
        text: msg.content,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isCurrentUser: msg.sender._id === currentUser,
        image: msg.mediaUrl,
        mediaUrl: msg.mediaUrl,
        isEdited: msg.edited || false,
        readBy: msg.readBy || [],
        deliveredTo: msg.deliveredTo || [],
      }));
      setMessages(formatted);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [groupId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  useEffect(() => {
    if (editingMessage && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingMessage]);

  useEffect(() => {
    return () => {
      if (filePreview?.url) {
        URL.revokeObjectURL(filePreview.url);
      }
    };
  }, [filePreview]);

  const handleSend = async () => {
    if (!message.trim() && !file) return;
    try {
      let mediaUrl = null;
      if (file) {
        setIsUploading(true);
        const url = await uploadToCloudinary(file);
        mediaUrl = url;
      }
      const payload = {
        groupId,
        content: message,
        sender: currentUser,
        mediaUrl,
      };
      sendMessage(payload);
      setMessage("");
      setFile(null);
      setFilePreview(null);
      setIsUploading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      console.error("Send error", err);
      setIsUploading(false);
    }
  };

  const handleEdit = (msg) => {
    setEditingMessage(msg.id);
    setEditText(msg.text);
  };

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    const payload = {
      messageId: editingMessage,
      content: editText,
      groupId,
    };
    editMessage(payload);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEditKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const getInitials = (email) => {
    return email.split("@")[0].charAt(0).toUpperCase();
  };

  const getUserName = (username) => {
    return username;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      createFilePreview(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    if (filePreview?.url) {
      URL.revokeObjectURL(filePreview.url);
    }
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderMediaContent = (mediaUrl) => {
    if (!mediaUrl) return null;
    const mediaType = getMediaTypeFromUrl(mediaUrl);
    if (mediaType === "image") {
      return (
        <div className="mb-2">
          <img
            src={mediaUrl}
            alt="Shared image"
            className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(mediaUrl, "_blank")}
          />
        </div>
      );
    } else if (mediaType === "video/mp4") {
      return (
        <div className="mb-2">
          <video
            src={mediaUrl}
            controls
            className="max-w-full h-auto rounded-lg"
            style={{ maxHeight: "300px" }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
    return null;
  };

  const handleInfoClick = (msg) => {
    setShowInfoModal(msg.id);
  };

  const closeInfoModal = () => {
    setShowInfoModal(null);
  };

  if (!groupId) {
    return (
      <div className="w-3/4 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                // strokewidthhintwidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Welcome to Chat
          </h3>
          <p className="text-gray-500">
            Select a group to start chatting with your team
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-3/4 flex flex-col h-full bg-white">
      <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              G
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Group</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.isCurrentUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex max-w-xs lg:max-w-md ${
                msg.isCurrentUser ? "flex-row-reverse" : "flex-row"
              } gap-2 group`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
                  msg.isCurrentUser ? "bg-blue-600" : "bg-gray-400"
                }`}
              >
                {getInitials(msg.sender)}
              </div>

              <div className="flex flex-col">
                <div
                  className={`px-4 py-2 rounded-2xl shadow-sm relative ${
                    msg.isCurrentUser
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white text-gray-900 rounded-bl-md border border-gray-200"
                  }`}
                >
                  {!msg.isCurrentUser && (
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      {getUserName(msg.username)}
                    </div>
                  )}

                  {(msg.isCurrentUser || !msg.isCurrentUser) && (
                    <button
                      onClick={() => handleInfoClick(msg)}
                      className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                        msg.isCurrentUser
                          ? "bg-white text-blue-600 shadow-md"
                          : "bg-gray-100 text-gray-600"
                      }`}
                      title="Message Info"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                  )}

                  {msg.isCurrentUser && msg.text && (
                    <button
                      onClick={() => handleEdit(msg)}
                      className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                        msg.isCurrentUser
                          ? "bg-white text-blue-600 shadow-md"
                          : "bg-gray-100 text-gray-600"
                      }`}
                      title="Edit message"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  )}

                  {(msg.image || msg.mediaUrl) &&
                    renderMediaContent(msg.mediaUrl || msg.image)}

                  {msg.text && (
                    <>
                      {editingMessage === msg.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            ref={editInputRef}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={handleEditKeyPress}
                            className="bg-white text-gray-900 border border-gray-300 rounded px-2 py-1 text-sm resize-none min-h-[60px]"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleCancelEdit}
                              className="px-2 py-1 bg-white cursor-pointer rounded text-xs"
                            >
                              ❌
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          {msg.isEdited && (
                            <span className="text-xs opacity-70 italic">
                              (edited)
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div
                  className={`text-xs text-gray-500 mt-1 ${
                    msg.isCurrentUser ? "text-right" : "text-left"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>

            {showInfoModal === msg.id && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-80 max-w-full">
                  <h3 className="text-lg font-semibold mb-4">Message Info</h3>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      Read By:
                    </h4>
                    {msg.readBy.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        {msg.readBy.map((user, index) => (
                          <li key={index}>{user}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600">
                        No one has read this message yet.
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      Delivered To:
                    </h4>
                    {msg.deliveredTo.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        {msg.deliveredTo.map((user, index) => (
                          <li key={index}>{user}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Not delivered to anyone yet.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={closeInfoModal}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        {file && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 relative">
                {filePreview?.type === "image" ? (
                  <div className="relative">
                    <img
                      src={filePreview.url}
                      alt="Preview"
                      className="w-40 h-40 object-cover rounded-lg border border-gray-300 shadow-sm"
                    />
                    <button
                      onClick={handleRemoveFile}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors duration-200"
                      title="Remove image"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : filePreview?.type === "video/mp4" ? (
                  <div className="relative">
                    <video
                      src={filePreview.url}
                      className="w-40 h-40 object-cover rounded-lg border border-gray-300 shadow-sm"
                      muted
                    />
                    <button
                      onClick={handleRemoveFile}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors duration-200"
                      title="Remove video"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors duration-200"
                      title="Remove file"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(file.size)}
                  </p>
                  {filePreview?.type && (
                    <span className="inline-flex items-center px-2 py-1 mt-2 bg-blue-100 text-blue-800 rounded-full text-xs font-medium w-fit">
                      {filePreview.type === "image" ? (
                        <>
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Image
                        </>
                      ) : filePreview.type === "video/mp4" ? (
                        <>
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Video
                        </>
                      ) : (
                        "File"
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-end gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 flex-shrink-0"
            disabled={isUploading}
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              className="w-full p-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all duration-200 min-h-[44px] max-h-32"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={1}
              style={{ height: "auto" }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={(!message.trim() && !file) || isUploading}
            className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
              (message.trim() || file) && !isUploading
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isUploading ? (
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
