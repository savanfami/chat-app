import React, { useState, useRef, useEffect } from "react";
import { axiosInstance } from "../../../constants/axiosInstance";
import { jwtDecode } from "jwt-decode";
import { useSocket } from "../../utils/customHooks/useSocket";
import { uploadToCloudinary } from "../../utils/common/cloudinary";

const ChatWindow = ({ groupId }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const token = localStorage.getItem("token");

  let currentUser = "";
  if (token) {
    const decoded = jwtDecode(token);
    currentUser = decoded.userId;
  }

  const { sendMessage } = useSocket(groupId, (msg) => {
    const formattedMsg = {
      id: msg.id,
      sender: msg.sender.email,
      username: msg.sender.username,
      text: msg.content,
      timestamp: msg.timestamp,
      isCurrentUser: msg.sender._id === currentUser,
      image: msg.image, // Add image support
    };

    setMessages((prev) => [...prev, formattedMsg]);
  });

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
        image: msg.image, // Add image support
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
    scrollToBottom();
  }, [messages]);

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
      setIsUploading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      console.error("Send error", err);
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (email) => {
    return email.split("@")[0].charAt(0).toUpperCase();
  };

  const getUserName = (username) => {
    return username;
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      console.log("File selected:", selectedFile);
      setFile(selectedFile);
    }
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
                strokeWidth={2}
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
              <h2 className="font-semibold text-gray-900"> Chat</h2>
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
              } gap-2`}
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
                  className={`px-4 py-2 rounded-2xl shadow-sm ${
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

                  {/* Display image if exists */}
                  {msg.image && (
                    <div className="mb-2">
                      <img
                        src={msg.image}
                        alt="Shared image"
                        className="max-w-full h-auto rounded-lg cursor-pointer"
                        onClick={() => window.open(msg.image, "_blank")}
                      />
                    </div>
                  )}

                  {/* Display text if exists */}
                  {msg.text && (
                    <p className="text-sm leading-relaxed">{msg.text}</p>
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
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        {/* File Preview */}
        {file && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm text-gray-700">{file.name}</span>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-gray-500 hover:text-gray-700"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="flex items-end gap-3">
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Attachment Button */}
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
              onKeyPress={handleKeyPress}
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
