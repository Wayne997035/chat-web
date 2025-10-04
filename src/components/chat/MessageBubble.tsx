import { memo } from 'react';
import type { Message, Room } from '../../types';
import { getDisplayName, getInitials, getAvatarColor } from '../../utils/formatters';
import { escapeHtml } from '../../utils/sanitize';
import { useChatStore } from '../../store/chatStore';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
  room: Room | null;
}

const MessageBubble = memo(({ message, room }: MessageBubbleProps) => {
  const { currentUser } = useChatStore();

  // 系統訊息
  if (message.type === 'system' || message.sender_id === 'system') {
    return (
      <div className="message system">
        <div className="message-content">
          {escapeHtml(message.content)}
        </div>
      </div>
    );
  }

  const isOwn = message.sender_id === currentUser;
  const senderName = getDisplayName(message.sender_id);
  const time = new Date(message.created_at * 1000).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // 計算已讀狀態
  const readBy = message.read_by || [];
  const otherReadBy = readBy.filter(userId => 
    userId !== currentUser && userId !== message.sender_id
  );
  const readCount = otherReadBy.length;

  let readStatus = '';
  if (isOwn) {
    if (readCount > 0) {
      if (room && room.type === 'group') {
        readStatus = `${readCount}已讀`;
      } else {
        readStatus = '已讀';
      }
    } else {
      readStatus = '已送達';
    }
  }

  const avatarColor = getAvatarColor(message.sender_id);

  return (
    <div className={`message ${isOwn ? 'own' : 'other'}`}>
      <div className="message-avatar" style={{ backgroundColor: avatarColor }}>
        {getInitials(senderName)}
      </div>
      <div className="message-wrapper">
        <div className="message-content">
          {escapeHtml(message.content)}
        </div>
        <div className="message-info">
          {isOwn ? (
            <>
              <span>{time}</span>
              {readStatus && <span className="read-status">{readStatus}</span>}
            </>
          ) : (
            <span>{senderName} • {time}</span>
          )}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;

