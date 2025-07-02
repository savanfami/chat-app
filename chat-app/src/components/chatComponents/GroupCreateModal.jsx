import React, { useState } from 'react';

const GroupCreateModal = ({ onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState([]);

  const allUsers = ['user1@example.com', 'user2@example.com', 'user3@example.com'];

  const handleCreateGroup = () => {
    console.log('Group Created:', { groupName, members });
    onClose();
  };

  const handleSelectMembers = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((option) => option.value);
    setMembers(selected);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Create Group</h2>
        <input
          className="w-full border p-2 mb-3"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <div className="mb-3">
          <label className="block mb-1 font-medium">Select Members</label>
          <select
            multiple
            value={members}
            onChange={handleSelectMembers}
            className="w-full border p-2 h-32"
          >
            {allUsers.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-gray-600">Cancel</button>
          <button
            onClick={handleCreateGroup}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupCreateModal;
