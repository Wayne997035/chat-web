import { useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { getInitials, getAvatarColor } from '../../utils/formatters';
import type { Room } from '../../types';
import './ContactList.css';

const users = [
  { id: 'user_alice', name: 'Alice', online: true },
  { id: 'user_bob', name: 'Bob', online: true },
  { id: 'user_charlie', name: 'Charlie', online: false },
  { id: 'user_david', name: 'David', online: false },
  { id: 'user_emma', name: 'Emma', online: true },
  { id: 'user_frank', name: 'Frank', online: true },
  { id: 'user_grace', name: 'Grace', online: false },
];

const ContactList = () => {
  const { currentUser, openChatPopup } = useChatStore();
  const [loading, setLoading] = useState<string | null>(null);

  const handleStartChat = (contactId: string) => {
    if (contactId === currentUser) return;
    
    setLoading(contactId);
    
    try {
      // 檢查是否已經有與此聯絡人的聊天室
      const { rooms } = useChatStore.getState();
      
      const existingRoom = rooms.find(room => {
        if (room.type !== 'direct') return false;
        
        // 方法1: 通過 members 匹配
        if (room.members && room.members.length > 0) {
          const hasContact = room.members.some(m => m.user_id === contactId);
          const hasCurrentUser = room.members.some(m => m.user_id === currentUser);
          if (hasContact && hasCurrentUser) return true;
        }
        
        // 方法2: 通過 room.name 匹配（格式：user_alice_user_charlie）
        if (room.name) {
          const nameIncludesContact = room.name.includes(contactId);
          const nameIncludesCurrentUser = room.name.includes(currentUser);
          if (nameIncludesContact && nameIncludesCurrentUser) return true;
        }
        
        return false;
      });

      if (existingRoom) {
        // 如果已存在，直接打開彈跳視窗
        // 確保 members 字段存在（用於顯示名稱）
        const roomWithMembers: Room = {
          ...existingRoom,
          members: existingRoom.members || [
            { user_id: currentUser, role: 'admin' },
            { user_id: contactId, role: 'member' },
          ],
        };
        openChatPopup(roomWithMembers);
        return;
      }

      // 創建臨時聊天室（不發送到後端）
      const tempRoom: Room = {
        id: `temp_${contactId}`,
        name: '', // 名稱會由 getRoomDisplayName 計算
        type: 'direct',
        owner_id: currentUser,
        members: [
          { user_id: currentUser, role: 'admin' },
          { user_id: contactId, role: 'member' },
        ],
        created_at: Math.floor(Date.now() / 1000),
        isTemporary: true,
        targetContactId: contactId,
      };

      // 打開彈跳視窗
      openChatPopup(tempRoom);
    } finally {
      // 確保 loading 狀態被清除
      setLoading(null);
    }
  };

  const availableContacts = users.filter(u => u.id !== currentUser);

  return (
    <div className="contacts-section">
      <h4>聯絡人</h4>
      <div className="contacts-list">
        {availableContacts.map(contact => {
          const avatarColor = getAvatarColor(contact.id);
          return (
            <div
              key={contact.id}
              className={`contact-item ${loading === contact.id ? 'loading' : ''}`}
              onClick={() => handleStartChat(contact.id)}
            >
              <div 
                className={`contact-avatar ${contact.online ? 'online' : ''}`}
                style={{ backgroundColor: avatarColor }}
              >
                {getInitials(contact.name)}
              </div>
              <div className="contact-info">
                <div className="contact-name">{contact.name}</div>
                <div className="contact-status">
                  {loading === contact.id ? '創建中...' : (contact.online ? '在線上' : '離線')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContactList;

