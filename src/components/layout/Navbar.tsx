import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import { Avatar } from '../ui/Avatar';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, logout, rooms } = useChatStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const totalUnread = rooms.reduce((total, room) => {
    return total + (room.unread_count || 0);
  }, 0);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showUserMenu) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showUserMenu]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement search
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <nav
      className="
        fixed top-0 left-0 right-0
        h-12 md:h-14
        bg-primary-700
        shadow-[0_2px_4px_rgba(0,0,0,0.24)]
        z-[600]
        flex items-center px-4 gap-4
      "
      aria-label="主要導覽"
    >
      {/* Left: Logo */}
      <Link
        to="/"
        aria-label="ChatOwl 首頁"
        className="
          flex items-center gap-2 shrink-0
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-white focus-visible:ring-offset-2
          focus-visible:ring-offset-primary-700 rounded-lg
        "
      >
        <img
          src="/logo.png"
          alt="ChatOwl logo"
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-lg font-semibold text-white hidden sm:block">
          ChatOwl
        </span>
      </Link>

      {/* Center: Search (hidden on mobile) */}
      <form
        onSubmit={handleSearch}
        className="hidden md:flex flex-1 max-w-xl mx-2"
        role="search"
      >
        <input
          type="search"
          aria-label="搜尋對話"
          role="searchbox"
          placeholder="搜尋對話或聯絡人..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="
            w-full
            bg-white/12 border border-white/20
            rounded-full px-4 py-2
            text-white text-sm
            placeholder:text-white/55
            hover:bg-white/15 hover:border-white/30
            focus-visible:outline-none
            focus-visible:bg-white/18
            focus-visible:border-white/40
            focus-visible:ring-2 focus-visible:ring-white/30
            transition-all duration-150
          "
        />
      </form>

      {/* Right: actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Bell */}
        <button
          onClick={() => navigate('/messages')}
          aria-label="通知"
          aria-haspopup="true"
          className="
            relative flex items-center justify-center
            w-10 h-10 rounded-full
            text-white/90
            hover:bg-white/12 active:bg-white/20
            transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-white focus-visible:ring-offset-1
            focus-visible:ring-offset-primary-700
          "
        >
          <span className="text-base" aria-hidden="true">🔔</span>
          {totalUnread > 0 && (
            <>
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full"
                aria-hidden="true"
              />
              <span className="sr-only">{totalUnread} 則未讀通知</span>
            </>
          )}
        </button>

        {/* User menu (desktop) */}
        <div className="relative hidden md:block">
          <button
            ref={triggerRef}
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="使用者選單"
            aria-haspopup="true"
            aria-expanded={showUserMenu}
            className="
              flex items-center gap-1.5 px-2 py-1 rounded-lg
              hover:bg-white/12 active:bg-white/20
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-white rounded-lg
            "
          >
            <Avatar name={currentUser} size="sm" />
            <span
              className={`text-white/70 text-xs transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {showUserMenu && (
            <div
              ref={dropdownRef}
              role="menu"
              className="
                absolute right-0 top-full mt-1
                w-60
                bg-white dark:bg-[#1a2438]
                rounded-xl shadow-xl
                border border-neutral-200 dark:border-[#2d3748]
                z-[100]
                py-1
              "
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
                <Avatar name={currentUser} size="lg" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {currentUser}
                  </p>
                </div>
              </div>

              <Link
                to="/profile"
                role="menuitem"
                onClick={() => setShowUserMenu(false)}
                className="
                  flex items-center gap-3 w-full
                  px-4 py-2.5
                  text-sm text-neutral-700 dark:text-neutral-300
                  hover:bg-neutral-100 dark:hover:bg-white/8
                  transition-colors duration-150
                  focus-visible:outline-none focus-visible:bg-neutral-100
                "
              >
                個人資料
              </Link>

              <Link
                to="/settings"
                role="menuitem"
                onClick={() => setShowUserMenu(false)}
                className="
                  flex items-center gap-3 w-full
                  px-4 py-2.5
                  text-sm text-neutral-700 dark:text-neutral-300
                  hover:bg-neutral-100 dark:hover:bg-white/8
                  transition-colors duration-150
                  focus-visible:outline-none focus-visible:bg-neutral-100
                "
              >
                設定
              </Link>

              <div className="my-1 border-t border-neutral-200 dark:border-neutral-700" role="separator" />

              <button
                role="menuitem"
                onClick={handleLogout}
                className="
                  w-full flex items-center gap-3
                  px-4 py-2.5
                  text-sm text-error-500
                  hover:bg-error-100 dark:hover:bg-error-500/10
                  transition-colors duration-150
                  focus-visible:outline-none focus-visible:bg-error-100
                "
              >
                登出
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
