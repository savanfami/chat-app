import React, { useState } from 'react';

const ChatWindow = ({ groupId }) => {
  const [message, setMessage] = useState('');

  const messages = [
    { sender: 'user1@example.com', text: 'Hey team!' },
    { sender: 'user2@example.com', text: 'Let’s start the meeting.' },
  ];

  const handleSend = () => {
    if (message.trim()) {
      console.log('Send message:', message);
      setMessage('');
    }
  };

  if (!groupId) {
    return <div className="w-3/4 flex items-center justify-center">Select a group to start chatting</div>;
  }

  return (
    <div className="w-3/4 flex flex-col h-full">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div className="p-4 border-t flex">
        <input
          className="flex-1 border p-2 mr-2 rounded"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
