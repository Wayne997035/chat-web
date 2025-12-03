import { useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { chatApi } from '../../api/chat';
import { validateRoomName } from '../../utils/validation';
import type { Member } from '../../types';
import './CreateRoomModal.css';

interface CreateRoomModalProps {
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

const CreateRoomModal = ({ onClose }: CreateRoomModalProps) => {
  const { currentUser, addRoom, openChatPopup } = useChatStore();
  const [roomName, setRoomName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const availableUsers = users.filter(u => u.id !== currentUser);

  const toggleMember = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleCreate = async () => {
    setError('');
    
    if (!roomName.trim()) {
      setError('請輸入群組名稱');
      return;
    }

    if (selectedMembers.length === 0) {
      setError('請至少選擇一個成員');
      return;
    }

    try {
      validateRoomName(roomName);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      return;
    }

    setLoading(true);
    try {
      const members: Member[] = [
        { user_id: currentUser, role: 'admin' },
        ...selectedMembers.map(id => ({ user_id: id, role: 'member' as const })),
      ];

      const response = await chatApi.createRoom({
        name: roomName,
        type: 'group',
        owner_id: currentUser,
        members,
      });

      if (response.success && response.data) {
        // 添加新聊天室並打開彈跳視窗
        addRoom(response.data);
        openChatPopup(response.data);
        onClose();
      }
    } catch (error) {
      console.error('創建群組失敗:', error);
      setError('創建群組失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>創建群組</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>群組名稱</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="輸入群組名稱"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>選擇成員（{selectedMembers.length}已選）</label>
            <div className="member-list">
              {availableUsers.map(user => (
                <div
                  key={user.id}
                  className={`member-item ${selectedMembers.includes(user.id) ? 'selected' : ''}`}
                  onClick={() => toggleMember(user.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(user.id)}
                    readOnly
                  />
                  <span>{user.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            取消
          </button>
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? '創建中...' : '創建群組'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;

