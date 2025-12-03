import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { getDisplayName, getInitials, getAvatarColor } from '../utils/formatters';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { rooms, currentUser, openChatPopup } = useChatStore();

  // 取得最近的對話
  const recentChats = rooms.slice(0, 5);

  // 計算未讀消息總數
  const totalUnread = rooms.reduce((total, room) => {
    return total + (room.unread_count || 0);
  }, 0);

  // 計算有未讀消息的聊天室數量
  const unreadRoomsCount = rooms.filter(room => (room.unread_count || 0) > 0).length;

  const handleStartChat = () => {
    navigate('/messages');
  };

  const handleViewRoom = (roomId: string) => {
    // 設置當前聊天室並打開彈跳視窗
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      openChatPopup(room);
    }
  };

  // 獲取聊天室顯示名稱
  const getRoomDisplayName = (room: any): string => {
    if (room.type === 'group') {
      return room.name;
    } else if (room.type === 'direct' && room.members) {
      const otherMember = room.members.find((m: any) => m.user_id !== currentUser);
      if (otherMember) {
        return getDisplayName(otherMember.user_id);
      }
    }
    return room.name;
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="welcome-section">
          <h1 className="welcome-title">歡迎回來，{currentUser}</h1>
          <p className="welcome-subtitle">開始與朋友、家人和同事保持聯繫</p>
          
          {/* 未讀通知統計 */}
          {totalUnread > 0 && (
            <div className="notification-summary">
              <div className="notification-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor"/>
                </svg>
                {totalUnread > 0 && <span className="notification-badge">{totalUnread > 99 ? '99+' : totalUnread}</span>}
              </div>
              <div className="notification-text">
                <strong>你有 {totalUnread} 則未讀訊息</strong>
                <span>來自 {unreadRoomsCount} 個對話</span>
              </div>
              <button className="notification-btn" onClick={handleStartChat}>
                查看
              </button>
            </div>
          )}
        </div>

        <div className="quick-actions">
          <button className="action-card primary" onClick={handleStartChat}>
            <div className="action-icon">+</div>
            <div className="action-content">
              <h3>開始新對話</h3>
              <p>與聯絡人開始一對一或群組聊天</p>
            </div>
          </button>
          
          <button className="action-card" onClick={() => navigate('/contacts')}>
            <div className="action-icon">@</div>
            <div className="action-content">
              <h3>聯絡人</h3>
              <p>查看和管理你的聯絡人</p>
            </div>
          </button>
          
          <button className="action-card" onClick={() => navigate('/groups')}>
            <div className="action-icon">#</div>
            <div className="action-content">
              <h3>我的群組</h3>
              <p>查看所有群組對話</p>
            </div>
          </button>
        </div>

        {recentChats.length > 0 && (
          <div className="recent-section">
            <div className="section-header">
              <h2>最近對話</h2>
              <button className="link-button" onClick={handleStartChat}>
                查看全部
              </button>
            </div>
            
            <div className="recent-chats">
              {recentChats.map((room) => {
                const displayName = getRoomDisplayName(room);
                const avatarColor = getAvatarColor(room.id);
                return (
                  <div 
                    key={room.id} 
                    className="chat-card"
                    onClick={() => handleViewRoom(room.id)}
                  >
                    <div className="chat-avatar" style={{ backgroundColor: avatarColor }}>
                      {getInitials(displayName)}
                    </div>
                    <div className="chat-info">
                      <h3 className="chat-name">{displayName}</h3>
                      <p className="chat-preview">
                        {room.last_message || '開始對話...'}
                      </p>
                    </div>
                    {(room.unread_count || 0) > 0 && (
                      <div className="unread-badge">{room.unread_count}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="features-section">
          <h2>功能特色</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">即時</div>
              <h3>即時通訊</h3>
              <p>訊息即時送達，不錯過任何重要訊息</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">群組</div>
              <h3>群組聊天</h3>
              <p>建立群組，與多人同時對話</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">安全</div>
              <h3>安全可靠</h3>
              <p>訊息加密傳輸，保護你的隱私</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
