import React, { useState } from "react";

import Sidebar from "./Sidebar";
import GroupCreateModal from "./GroupCreateModal";
import ChatWindow from "./ChatWindow";

const ChatDashboard = () => {
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupCreatedTrigger, setGroupCreatedTrigger] = useState(0);

  return (
    <div className="flex h-screen">
      <Sidebar
        onCreateGroup={() => setGroupModalOpen(true)}
        onSelectGroup={setSelectedGroupId}
        groupCreatedTrigger={groupCreatedTrigger}
      />    
      <ChatWindow groupId={selectedGroupId} />
      {isGroupModalOpen && (
        <GroupCreateModal
          onClose={() => setGroupModalOpen(false)}
          onGroupCreated={() => {
            setGroupModalOpen(false);
            setGroupCreatedTrigger((prev) => prev + 1);
          }}
        />
      )}
    </div>
  );
};

export default ChatDashboard;
