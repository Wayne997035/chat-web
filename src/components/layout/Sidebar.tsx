import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import { getInitials, getAvatarColor } from '../../utils/formatters';
import type { Room } from '../../types';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { currentUser, rooms, roomsLoaded, openChatPopup } = useChatStore();
  const [loadingContact, setLoadingContact] = useState<string | null>(null);

  const getUserAvatar = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    const colorIndex = currentUser.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  const menuItems = [
    { path: '/messages', icon: '', label: '所有對話' },
    { path: '/contacts', icon: '', label: '聯絡人' },
    { path: '/groups', icon: '', label: '我的群組' },
    { path: '/starred', icon: '', label: '重要訊息' },
    { path: '/archived', icon: '', label: '封存對話' },
  ];

  const quickActions = [
    { label: '建立群組', action: 'create-group', icon: '+' },
    { label: '新增聯絡人', action: 'add-contact', icon: '@' },
  ];

  // 在線聯絡人列表
  const onlineUsers = [
    { id: 'user_alice', name: 'Alice', online: true },
    { id: 'user_bob', name: 'Bob', online: true },
    { id: 'user_charlie', name: 'Charlie', online: true },
    { id: 'user_david', name: 'David', online: true },
    { id: 'user_emma', name: 'Emma', online: true },
    { id: 'user_frank', name: 'Frank', online: true },
    { id: 'user_grace', name: 'Grace', online: true },
  ].filter(u => u.id !== currentUser && u.online);

  // 尋找已存在的聊天室
  const findExistingRoom = (contactId: string): Room | undefined => {
    return rooms.find(room => {
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

  const handleStartChatWithContact = async (contactId: string) => {
    if (contactId === currentUser || loadingContact) return;
    
    // 如果 rooms 已經載入完成，直接檢查
    if (roomsLoaded) {
      const existingRoom = findExistingRoom(contactId);

      if (existingRoom) {
        // 確保 members 字段存在
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
    setLoadingContact(contactId);
    
    const startTime = Date.now();
    const maxWaitTime = 5000; // 5 秒

    const checkAndOpen = () => {
      const { rooms: latestRooms, roomsLoaded: loaded } = useChatStore.getState();
      
      // 如果已載入，檢查聊天室
      if (loaded) {
        setLoadingContact(null);
        
        const existingRoom = latestRooms.find(room => {
          if (room.type !== 'direct') return false;
          if (room.members && room.members.length > 0) {
            const hasContact = room.members.some(m => m.user_id === contactId);
            const hasCurrentUser = room.members.some(m => m.user_id === currentUser);
            if (hasContact && hasCurrentUser) return true;
          }
          if (room.name) {
            const nameIncludesContact = room.name.includes(contactId);
            const nameIncludesCurrentUser = room.name.includes(currentUser);
            if (nameIncludesContact && nameIncludesCurrentUser) return true;
          }
          return false;
        });

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
        setLoadingContact(null);
        // 超時，打開臨時聊天室並標記為需要顯示錯誤
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

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar-left">
      <div className="sidebar-content">
        {/* 用戶資料 */}
        <Link 
          to="/profile" 
          className={`sidebar-item user-profile ${isActive('/profile') ? 'active' : ''}`}
        >
          <div 
            className="sidebar-avatar"
            style={{ backgroundColor: getUserAvatar() }}
          >
            {currentUser.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="sidebar-label">{currentUser}</span>
            <span className="user-status">在線上</span>
          </div>
        </Link>

        <div className="sidebar-divider"></div>

        {/* 主選單 */}
        <div className="sidebar-section">
          <div className="sidebar-section-header">選單</div>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="sidebar-label">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="sidebar-divider"></div>

        {/* 快速操作 */}
        <div className="sidebar-section">
          <div className="sidebar-section-header">快速操作</div>
          <div className="quick-actions-grid">
            {quickActions.map((action) => (
              <button
                key={action.action}
                className="quick-action-card"
                onClick={() => {/* TODO: 實作快速操作功能 */}}
              >
                <div className="quick-action-icon">{action.icon}</div>
                <span className="quick-action-label">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-divider"></div>

        {/* 在線聯絡人列表 */}
        {onlineUsers.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span className="online-indicator"></span>
              在線上 ({onlineUsers.length})
            </div>
            <div className="online-contacts-list-sidebar">
              {onlineUsers.map(contact => {
                const avatarColor = getAvatarColor(contact.id);
                const isLoading = loadingContact === contact.id;
                return (
                  <div
                    key={contact.id}
                    className={`online-contact-item-sidebar ${isLoading ? 'loading' : ''}`}
                    onClick={() => handleStartChatWithContact(contact.id)}
                  >
                    <div 
                      className="contact-avatar-small online"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {isLoading ? '...' : getInitials(contact.name)}
                    </div>
                    <span className="contact-name-small">
                      {isLoading ? '連線中...' : contact.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 底部資訊 */}
      <div className="sidebar-footer">
        <a href="#" className="footer-link">隱私權</a>
        <span>·</span>
        <a href="#" className="footer-link">條款</a>
        <div className="footer-copy">Cover Ones © 2025</div>
      </div>
    </aside>
  );
};

export default Sidebar;

