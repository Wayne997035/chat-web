import { useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { getInitials, getAvatarColor } from '../../utils/formatters';
import './ContactList.css';

const users = [
  { id: 'user_alice', name: 'Alice' },
  { id: 'user_bob', name: 'Bob' },
  { id: 'user_charlie', name: 'Charlie' },
  { id: 'user_david', name: 'David' },
];

const ContactList = () => {
  const { currentUser, setCurrentRoom } = useChatStore();
  const [loading, setLoading] = useState<string | null>(null);

  const handleStartChat = (contactId: string) => {
    if (contactId === currentUser) return;
    
    setLoading(contactId);
    
    // 檢查是否已經有與此聯絡人的聊天室
    const { rooms } = useChatStore.getState();
    const existingRoom = rooms.find(room => 
      room.type === 'direct' && 
      room.members && 
      room.members.some(member => member.user_id === contactId) &&
      room.members.some(member => member.user_id === currentUser)
    );

    if (existingRoom) {
      // 如果已存在，直接進入聊天室
      setCurrentRoom(existingRoom);
      setLoading(null);
      return;
    }

    // 創建臨時聊天室（不發送到後端）
    const tempRoom = {
      id: `temp_${contactId}`,
      name: `${currentUser}_${contactId}`,
      type: 'direct' as const,
      owner_id: currentUser,
      members: [
        { user_id: currentUser, role: 'admin' as const },
        { user_id: contactId, role: 'member' as const },
      ],
      created_at: Math.floor(Date.now() / 1000),
      isTemporary: true,
      targetContactId: contactId,
    };

    setCurrentRoom(tempRoom as any);
    setLoading(null);
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
              <div className="contact-avatar" style={{ backgroundColor: avatarColor }}>
                {getInitials(contact.name)}
              </div>
              <div className="contact-info">
                <div className="contact-name">{contact.name}</div>
                <div className="contact-status">
                  {loading === contact.id ? '創建中...' : '點擊開始對話'}
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

