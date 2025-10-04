import { memo } from 'react';
import type { Room } from '../../types';
import { formatMessageTime, getInitials, getDisplayName, getAvatarColor } from '../../utils/formatters';
import { useChatStore } from '../../store/chatStore';
import './RoomItem.css';

interface RoomItemProps {
  room: Room;
  onClick: () => void;
}

const RoomItem = memo(({ room, onClick }: RoomItemProps) => {
  const { currentRoom, currentUser } = useChatStore();
  const isActive = currentRoom?.id === room.id;

  // 獲取聊天室顯示名稱
  const getRoomDisplayName = (room: Room): string => {
    if (room.type === 'group') {
      return room.name;
    } else if (room.type === 'direct' && room.members) {
      const otherMember = room.members.find(m => m.user_id !== currentUser);
      if (otherMember) {
        return getDisplayName(otherMember.user_id);
      }
    }
    return room.name;
  };

  const displayName = getRoomDisplayName(room);
  const lastMessage = room.last_message || '開始新對話...';
  const lastTime = room.last_message_time ? formatMessageTime(room.last_message_time) : '';
  const unreadCount = room.unread_count || 0;
  
  // 獲取頭像顏色（群組用群組 ID，一對一用對方的 user_id）
  let avatarId = room.id;
  if (room.type === 'direct' && room.members) {
    const otherMember = room.members.find(m => m.user_id !== currentUser);
    if (otherMember) {
      avatarId = otherMember.user_id;
    }
  }
  const avatarColor = getAvatarColor(avatarId);

  return (
    <div 
      className={`room-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="room-avatar" style={{ backgroundColor: avatarColor }}>
        {getInitials(displayName)}
      </div>
      <div className="room-info">
        <div className="room-header">
          <div className="room-name">{displayName}</div>
          <div className="room-meta">
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
            <div className="room-time">{lastTime}</div>
          </div>
        </div>
        <div className="room-preview">{lastMessage}</div>
      </div>
    </div>
  );
});

RoomItem.displayName = 'RoomItem';

export default RoomItem;

