import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import { getInitials, getAvatarColor } from '../../utils/formatters';
import type { Room } from '../../types';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, rooms, setCurrentRoom } = useChatStore();

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

  const handleStartChatWithContact = (contactId: string) => {
    if (contactId === currentUser) return;
    
    // 檢查是否已經有與此聯絡人的聊天室
    const existingRoom = rooms.find(room => 
      room.type === 'direct' && 
      room.members && 
      room.members.some(member => member.user_id === contactId) &&
      room.members.some(member => member.user_id === currentUser)
    );

    if (existingRoom) {
      // 如果已存在，直接進入聊天室
      setCurrentRoom(existingRoom);
      navigate(`/messages/${existingRoom.id}`);
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

    setCurrentRoom(tempRoom);
    // 通過 state 傳遞臨時聊天室數據，確保 ChatRoomPage 能立即獲取
    navigate(`/messages/${tempRoom.id}`, { state: { tempRoom } });
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
                return (
                  <div
                    key={contact.id}
                    className="online-contact-item-sidebar"
                    onClick={() => handleStartChatWithContact(contact.id)}
                  >
                    <div 
                      className="contact-avatar-small online"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {getInitials(contact.name)}
                    </div>
                    <span className="contact-name-small">{contact.name}</span>
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

