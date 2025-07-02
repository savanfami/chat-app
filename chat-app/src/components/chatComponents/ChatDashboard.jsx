import React, { useState } from 'react';

import Sidebar from './Sidebar';
import GroupCreateModal from './GroupCreateModal';
import ChatWindow from './ChatWindow';

const ChatDashboard = () => {
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  return (
    <div className="flex h-screen">
      <Sidebar
        onCreateGroup={() => setGroupModalOpen(true)}
        onSelectGroup={setSelectedGroupId}
      />
      <ChatWindow groupId={selectedGroupId} />
      {isGroupModalOpen && <GroupCreateModal onClose={() => setGroupModalOpen(false)} />}
    </div>
  );
};

export default ChatDashboard;
