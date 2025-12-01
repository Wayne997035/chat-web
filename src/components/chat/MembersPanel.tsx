import { useChatStore } from '../../store/chatStore';
import { getInitials } from '../../utils/formatters';
import './MembersPanel.css';

interface MembersPanelProps {
  onClose: () => void;
}

const users = [
  { id: 'user_alice', name: 'Alice' },
  { id: 'user_bob', name: 'Bob' },
  { id: 'user_charlie', name: 'Charlie' },
  { id: 'user_david', name: 'David' },
  { id: 'user_emma', name: 'Emma' },
  { id: 'user_frank', name: 'Frank' },
  { id: 'user_grace', name: 'Grace' },
];

const MembersPanel = ({ onClose }: MembersPanelProps) => {
  const { currentUser, currentRoom } = useChatStore();

  if (!currentRoom || currentRoom.type !== 'group') return null;

  return (
    <div className="members-panel">
      <div className="members-panel-header">
        <h4>群組成員</h4>
        <button className="btn-close-panel" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="members-panel-list">
        {currentRoom.members?.map(member => {
          const user = users.find(u => u.id === member.user_id);
          const isCurrentUser = member.user_id === currentUser;
          const displayName = user?.name || member.user_id;
          
          return (
            <div key={member.user_id} className="member-panel-item">
              <div className="member-panel-avatar">
                {getInitials(displayName)}
              </div>
              <div className="member-panel-info">
                <div className="member-panel-name">
                  {displayName}
                  {isCurrentUser && <span className="you-badge">你</span>}
                </div>
                {member.role === 'admin' && (
                  <div className="member-panel-role">管理員</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MembersPanel;

