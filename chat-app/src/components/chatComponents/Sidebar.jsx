import React from 'react';

const Sidebar = ({ onCreateGroup, onSelectGroup }) => {
  const groups = [
    { id: '1', name: 'Team Alpha' },
    { id: '2', name: 'Project Squad' },
  ];

  return (
    <div className="w-1/4 bg-gray-100 p-4">
      <button
        className="bg-blue-500 text-white px-4 py-2 mb-4 rounded"
        onClick={onCreateGroup}
      >
        ➕ Create Group
      </button>

      <div>
        <h3 className="text-xl font-semibold mb-2">Groups</h3>
        {groups.map((group) => (
          <div
            key={group.id}
            className="cursor-pointer p-2 hover:bg-gray-200 rounded"
            onClick={() => onSelectGroup(group.id)}
          >
            {group.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
