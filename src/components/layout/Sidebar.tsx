import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import { getInitials, getAvatarColor } from '../../utils/formatters';
import type { Room } from '../../types';

const Sidebar = () => {
  const location = useLocation();
  const { currentUser, rooms, roomsLoaded, openChatPopup } = useChatStore();
  const [loadingContact, setLoadingContact] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { path: '/messages', label: '所有對話' },
    { path: '/contacts', label: '聯絡人' },
    { path: '/groups', label: '我的群組' },
    { path: '/starred', label: '重要訊息' },
    { path: '/archived', label: '封存對話' },
  ];

  const onlineUsers = [
    { id: 'user_alice', name: 'Alice', online: true },
    { id: 'user_bob', name: 'Bob', online: true },
    { id: 'user_charlie', name: 'Charlie', online: true },
    { id: 'user_david', name: 'David', online: true },
    { id: 'user_emma', name: 'Emma', online: true },
    { id: 'user_frank', name: 'Frank', online: true },
    { id: 'user_grace', name: 'Grace', online: true },
  ].filter(u => u.id !== currentUser && u.online);

  const findExistingRoom = (contactId: string): Room | undefined => {
    return rooms.find(room => {
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
  };

  const handleStartChatWithContact = async (contactId: string) => {
    if (contactId === currentUser || loadingContact) return;

    if (roomsLoaded) {
      const existingRoom = findExistingRoom(contactId);

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

    setLoadingContact(contactId);

    const startTime = Date.now();
    const maxWaitTime = 5000;

    const checkAndOpen = () => {
      const { rooms: latestRooms, roomsLoaded: loaded } = useChatStore.getState();

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

      if (Date.now() - startTime >= maxWaitTime) {
        setLoadingContact(null);
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
          connectionTimeout: true,
        };
        openChatPopup(tempRoom);
        return;
      }

      setTimeout(checkAndOpen, 100);
    };

    checkAndOpen();
  };

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className="
        hidden lg:flex flex-col
        fixed left-0 top-14
        w-80 h-[calc(100vh-56px)]
        bg-primary-800 dark:bg-primary-900
        overflow-hidden
        z-10
      "
    >
      {/* Header */}
      <div className="
        flex items-center justify-between
        h-[52px] px-4 flex-none
        border-b border-white/10
      ">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="w-6 h-6 rounded-md" aria-hidden="true" />
          <span className="text-base font-semibold text-white">ChatOwl</span>
        </div>
        <button
          aria-label="新增對話"
          className="
            flex items-center justify-center w-8 h-8 rounded-full
            text-white/70 hover:text-white hover:bg-white/12
            transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-white/50
          "
        >
          <span className="text-lg leading-none">+</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mx-3 my-2 flex-none">
        <input
          type="search"
          placeholder="搜尋對話..."
          aria-label="搜尋對話"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="
            w-full h-9 px-4
            bg-white/10 hover:bg-white/15
            border border-white/15 hover:border-white/25
            rounded-full
            text-sm text-white
            placeholder:text-white/50
            focus-visible:outline-none
            focus-visible:bg-white/18
            focus-visible:border-white/35
            focus-visible:ring-1 focus-visible:ring-white/30
            transition-all duration-150
          "
        />
      </div>

      {/* Navigation */}
      <nav aria-label="主要選單" className="flex-none px-2 pb-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5
              text-sm font-medium
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-white/50 focus-visible:ring-inset
              ${isActive(item.path)
                ? 'bg-primary-600 text-white'
                : 'text-white/75 hover:bg-white/8 hover:text-white'
              }
            `}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mx-4 border-t border-white/10 flex-none" />

      {/* Online contacts */}
      {onlineUsers.length > 0 && (
        <div className="flex-1 overflow-y-auto overscroll-contain py-2
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-white/20
          [&::-webkit-scrollbar-thumb]:rounded-full
        ">
          <div className="px-4 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success-500 flex-none" />
            <span className="text-xs font-semibold text-white/55 uppercase tracking-wider">
              在線上 ({onlineUsers.length})
            </span>
          </div>

          {onlineUsers.map(contact => {
            const avatarColor = getAvatarColor(contact.id);
            const isLoading = loadingContact === contact.id;
            return (
              <button
                key={contact.id}
                onClick={() => handleStartChatWithContact(contact.id)}
                className="
                  w-full flex items-center gap-3 px-3 py-2.5 mx-1
                  rounded-xl
                  text-white/75 hover:text-white hover:bg-white/8
                  transition-colors duration-150
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-white/50 focus-visible:ring-inset
                "
                style={{ width: 'calc(100% - 8px)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-none relative text-white text-xs font-semibold"
                  style={{ backgroundColor: avatarColor }}
                >
                  {isLoading ? (
                    <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    getInitials(contact.name)
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success-500 border-2 border-primary-800" />
                </div>
                <span className="text-sm font-medium truncate">
                  {isLoading ? '連線中...' : contact.name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="
        flex-none h-[52px] px-3
        border-t border-white/10
        flex items-center
      ">
        <button className="
          w-full flex items-center gap-2 px-3 py-2 rounded-xl
          text-white/55 hover:text-white hover:bg-white/8
          text-sm font-medium
          transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-white/50 focus-visible:ring-inset
        ">
          <span className="text-base">+</span>
          新增對話
        </button>
      </div>

      {/* Profile link at bottom */}
      <Link
        to="/profile"
        className={`
          flex items-center gap-3 px-4 py-3 flex-none
          border-t border-white/10
          transition-colors duration-150
          focus-visible:outline-none
          ${isActive('/profile')
            ? 'bg-primary-600'
            : 'hover:bg-white/8'
          }
        `}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-none"
          style={{ backgroundColor: '#4488FF' }}
        >
          {currentUser.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{currentUser}</p>
          <p className="text-xs text-success-400">在線上</p>
        </div>
      </Link>
    </aside>
  );
};

export default Sidebar;
