import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, logout, rooms } = useChatStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 計算未讀消息總數
  const totalUnread = rooms.reduce((total, room) => {
    return total + (room.unread_count || 0);
  }, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: 實作搜尋功能
      console.log('搜尋:', searchQuery);
    }
  };

  const getUserAvatar = () => {
    // 青藍色和紫色系列
    const colors = ['#06b6d4', '#8b5cf6', '#14b8a6', '#a855f7', '#0891b2'];
    const colorIndex = currentUser.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo 和搜尋 */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <img src="/logo.png" alt="Cover Ones" className="logo-image" />
          </Link>
          
          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="搜尋對話或聯絡人"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>
        </div>

        {/* 中間導航 */}
        <div className="navbar-center">
          <Link to="/messages" className="nav-item" title="對話">
            <span className="nav-icon">對話</span>
          </Link>
          <Link to="/contacts" className="nav-item" title="聯絡人">
            <span className="nav-icon">聯絡人</span>
          </Link>
          <Link to="/groups" className="nav-item" title="群組">
            <span className="nav-icon">群組</span>
          </Link>
        </div>

        {/* 右側用戶區 */}
        <div className="navbar-right">
          <button className="icon-btn" title="通知" onClick={() => navigate('/messages')}>
            {totalUnread > 0 && (
              <span className="notification-badge">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
            通知
          </button>
          
          <div className="user-menu-container">
            <button 
              className="user-avatar"
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ backgroundColor: getUserAvatar() }}
            >
              {currentUser.charAt(0).toUpperCase()}
            </button>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div 
                    className="dropdown-avatar"
                    style={{ backgroundColor: getUserAvatar() }}
                  >
                    {currentUser.charAt(0).toUpperCase()}
                  </div>
                  <div className="dropdown-name">{currentUser}</div>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/profile" className="dropdown-item">
                  個人資料
                </Link>
                <Link to="/settings" className="dropdown-item">
                  設定
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => {
                  logout();
                }}>
                  登出
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

