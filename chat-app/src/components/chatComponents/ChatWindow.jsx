import React, { useState, useRef, useEffect } from 'react';

const ChatWindow = ({ groupId }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentUser = 'currentuser@example.com';

  const messages = [
    { 
      id: 1,
      sender: 'user1@example.com', 
      text: 'Hey team! 👋', 
      timestamp: '10:30 AM',
      isCurrentUser: false
    },
    { 
      id: 2,
      sender: 'user2@example.com', 
      text: 'Let\'s start the meeting. I have some updates to share with everyone.', 
      timestamp: '10:32 AM',
      isCurrentUser: false
    },
    { 
      id: 3,
      sender: 'currentuser@example.com', 
      text: 'Sounds good! I\'m ready.', 
      timestamp: '10:33 AM',
      isCurrentUser: true
    },
    { 
      id: 4,
      sender: 'user1@example.com', 
      text: 'Perfect! Let me share my screen.', 
      timestamp: '10:34 AM',
      isCurrentUser: false
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      console.log('Send message:', message);
      setMessage('');
      // Focus back to input after sending
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (email) => {
    return email.split('@')[0].charAt(0).toUpperCase();
  };

  const getUserName = (email) => {
    return email.split('@')[0];
  };

  if (!groupId) {
    return (
      <div className="w-3/4 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Chat</h3>
          <p className="text-gray-500">Select a group to start chatting with your team</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-3/4 flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              G
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Group Chat</h2>
              <p className="text-sm text-gray-500">
                {messages.length > 0 ? `${messages.length} members` : 'No messages yet'}
              </p>
            </div>
          </div>
      
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-xs lg:max-w-md ${msg.isCurrentUser ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
                msg.isCurrentUser ? 'bg-blue-600' : 'bg-gray-400'
              }`}>
                {getInitials(msg.sender)}
              </div>
              
              {/* Message Bubble */}
              <div className="flex flex-col">
                <div
                  className={`px-4 py-2 rounded-2xl shadow-sm ${
                    msg.isCurrentUser
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                  }`}
                >
                  {!msg.isCurrentUser && (
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      {getUserName(msg.sender)}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <div className={`text-xs text-gray-500 mt-1 ${msg.isCurrentUser ? 'text-right' : 'text-left'}`}>
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
        <div className="flex items-end gap-3">
          {/* Attachment Button */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 flex-shrink-0">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              className="w-full p-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all duration-200 min-h-[44px] max-h-32"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              style={{ height: 'auto' }}
            />
            
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
              message.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
     
      </div>
    </div>
  );
};

export default ChatWindow;