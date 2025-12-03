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
  const { currentUser, roomsLoaded, openChatPopup } = useChatStore();
  const [loading, setLoading] = useState<string | null>(null);

  // 尋找已存在的聊天室
  const findExistingRoom = (contactId: string, roomsList: Room[]): Room | undefined => {
    return roomsList.find(room => {
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
  };

  const handleStartChat = async (contactId: string) => {
    if (contactId === currentUser || loading) return;
    
    // 如果 rooms 已經載入完成，直接檢查
    if (roomsLoaded) {
      const { rooms } = useChatStore.getState();
      const existingRoom = findExistingRoom(contactId, rooms);

      if (existingRoom) {
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

      // rooms 已載入但找不到聊天室，創建臨時聊天室
      const tempRoom: Room = {
        id: `temp_${contactId}`,
        name: '',
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
      openChatPopup(tempRoom);
      return;
    }

    // rooms 還沒載入完成，等待最多 5 秒
    setLoading(contactId);
    
    const startTime = Date.now();
    const maxWaitTime = 5000; // 5 秒

    const checkAndOpen = () => {
      const { rooms: latestRooms, roomsLoaded: loaded } = useChatStore.getState();
      
      // 如果已載入，檢查聊天室
      if (loaded) {
        setLoading(null);
        
        const existingRoom = findExistingRoom(contactId, latestRooms);

        if (existingRoom) {
          const roomWithMembers: Room = {
            ...existingRoom,
            members: existingRoom.members || [
              { user_id: currentUser, role: 'admin' },
              { user_id: contactId, role: 'member' },
            ],
          };
          openChatPopup(roomWithMembers);
        } else {
          // 找不到，創建臨時聊天室
          const tempRoom: Room = {
            id: `temp_${contactId}`,
            name: '',
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
          openChatPopup(tempRoom);
        }
        return;
      }

      // 檢查是否超時
      if (Date.now() - startTime >= maxWaitTime) {
        setLoading(null);
        // 超時，打開臨時聊天室並標記為連線超時
        const tempRoom: Room = {
          id: `temp_${contactId}`,
          name: '',
          type: 'direct',
          owner_id: currentUser,
          members: [
            { user_id: currentUser, role: 'admin' },
            { user_id: contactId, role: 'member' },
          ],
          created_at: Math.floor(Date.now() / 1000),
          isTemporary: true,
          targetContactId: contactId,
          connectionTimeout: true, // 標記為連線超時
        };
        openChatPopup(tempRoom);
        return;
      }

      // 繼續等待
      setTimeout(checkAndOpen, 100);
    };

    checkAndOpen();
  };

  const availableContacts = users.filter(u => u.id !== currentUser);

  return (
    <div className="contacts-section">
      <h4>聯絡人</h4>
      <div className="contacts-list">
        {availableContacts.map(contact => {
          const avatarColor = getAvatarColor(contact.id);
          const isLoading = loading === contact.id;
          return (
            <div
              key={contact.id}
              className={`contact-item ${isLoading ? 'loading' : ''}`}
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
                  {isLoading ? '連線中...' : (contact.online ? '在線上' : '離線')}
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
