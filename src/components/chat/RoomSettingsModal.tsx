import { useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { chatApi } from '../../api/chat';
import './RoomSettingsModal.css';

interface RoomSettingsModalProps {
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

const RoomSettingsModal = ({ onClose }: RoomSettingsModalProps) => {
  const { currentUser, currentRoom, setCurrentRoom, setRooms } = useChatStore();
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!currentRoom || currentRoom.type !== 'group') return null;

  // 可添加的用戶（不在群組中的）
  const memberIds = currentRoom.members?.map(m => m.user_id) || [];
  const availableUsers = users.filter(u => !memberIds.includes(u.id));

  // 添加成員
  const handleAddMember = async () => {
    if (!selectedUser) {
      setError('請選擇要添加的成員');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await chatApi.addMember(currentRoom.id, selectedUser);
      
      if (response.success) {
        setSuccess('成員添加成功');
        
        // 只在需要時才重新載入（減少請求）
        // 樂觀更新：手動添加成員到 currentRoom
        if (currentRoom.members) {
          const updatedRoom = {
            ...currentRoom,
            members: [...currentRoom.members, { user_id: selectedUser, role: 'member' as const }]
          };
          setCurrentRoom(updatedRoom);
        }
        
        setSelectedUser('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('添加成員失敗');
      }
    } catch (err) {
      setError('添加成員失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 移除成員
  const handleRemoveMember = async (userId: string) => {
    if (!confirm('確定要移除此成員嗎？')) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await chatApi.removeMember(currentRoom.id, userId);
      
      if (response.success) {
        setSuccess('成員移除成功');
        
        // 樂觀更新：直接從 currentRoom 移除成員
        if (currentRoom.members) {
          const updatedRoom = {
            ...currentRoom,
            members: currentRoom.members.filter(m => m.user_id !== userId)
          };
          setCurrentRoom(updatedRoom);
        }
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('移除成員失敗');
      }
    } catch (err) {
      setError('移除成員失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 退出群組
  const handleLeaveRoom = async () => {
    if (!confirm('確定要退出群組嗎？')) return;

    setLoading(true);
    setError('');

    try {
      const response = await chatApi.removeMember(currentRoom.id, currentUser);
      
      if (response.success) {
        // 清除當前聊天室
        setCurrentRoom(null);
        
        // 樂觀更新：直接從 rooms 移除這個聊天室
        setRooms((prevRooms) => prevRooms.filter(r => r.id !== currentRoom.id));
        
        onClose();
      } else {
        setError('退出群組失敗');
      }
    } catch (err) {
      setError('退出群組失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>群組設置</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="settings-section">
            <h4>群組成員 ({currentRoom.members?.length || 0})</h4>
            <div className="members-list-container">
              {currentRoom.members?.map(member => {
                const user = users.find(u => u.id === member.user_id);
                const isCurrentUser = member.user_id === currentUser;
                
                return (
                  <div key={member.user_id} className="member-item-row">
                    <div className="member-info-row">
                      <span className="member-name">
                        {user?.name || member.user_id}
                      </span>
                      {member.role === 'admin' && (
                        <span className="badge badge-admin">管理員</span>
                      )}
                      {isCurrentUser && (
                        <span className="badge badge-me">我</span>
                      )}
                    </div>
                    {!isCurrentUser && (
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveMember(member.user_id)}
                        disabled={loading}
                      >
                        移除
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {availableUsers.length > 0 && (
            <div className="settings-section">
              <h4>添加成員</h4>
              <div className="add-member-row">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  disabled={loading}
                  className="member-select"
                >
                  <option value="">選擇要添加的成員</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <button
                  className="btn btn-primary"
                  onClick={handleAddMember}
                  disabled={loading || !selectedUser}
                >
                  添加
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-danger"
            onClick={handleLeaveRoom}
            disabled={loading}
          >
            退出群組
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomSettingsModal;

