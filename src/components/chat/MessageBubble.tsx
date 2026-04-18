import { memo } from 'react';
import type { Message, Room } from '../../types';
import { getDisplayName, getInitials, getAvatarColor } from '../../utils/formatters';
import { escapeHtml } from '../../utils/sanitize';
import { useChatStore } from '../../store/chatStore';

interface MessageBubbleProps {
  message: Message;
  room: Room | null;
}

const MessageBubble = memo(({ message, room }: MessageBubbleProps) => {
  const { currentUser } = useChatStore();

  // 系統訊息
  if (message.type === 'system' || message.sender_id === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">
          {escapeHtml(message.content)}
        </span>
      </div>
    );
  }

  const isOwn = message.sender_id === currentUser;
  const senderName = getDisplayName(message.sender_id);
  const time = new Date(message.created_at * 1000).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // 計算已讀狀態
  const readBy = message.read_by ?? [];
  const otherReadBy = readBy.filter(
    (userId) => userId !== currentUser && userId !== message.sender_id
  );
  const readCount = otherReadBy.length;

  let readStatusLabel = '';
  if (isOwn) {
    if (readCount > 0) {
      if (room && room.type === 'group') {
        readStatusLabel = `${readCount}已讀`;
      } else {
        readStatusLabel = '已讀';
      }
    } else {
      readStatusLabel = '已送達';
    }
  }

  const avatarColor = getAvatarColor(message.sender_id);
  const initial = getInitials(senderName);

  if (isOwn) {
    return (
      <div className="flex justify-end mb-2">
        <div
          className="
            max-w-[70%]
            bg-primary-500 text-white
            px-4 py-2.5
            rounded-[18px_18px_4px_18px]
            text-sm leading-relaxed
            shadow-[0_1px_2px_rgba(0,0,0,0.12)]
          "
        >
          <p className="break-words whitespace-pre-wrap">{escapeHtml(message.content)}</p>
          <div className="flex items-center justify-end gap-1 mt-1">
            <time className="text-[10px] text-white/65">{time}</time>
            {readStatusLabel && (
              <span className="text-[10px] text-white/65">{readStatusLabel}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 mb-2">
      {/* Avatar */}
      <div
        className="
          w-6 h-6 rounded-full flex-none
          flex items-center justify-center
          text-[10px] font-semibold text-white select-none
          self-end mb-0.5
        "
        style={{ backgroundColor: avatarColor }}
        aria-hidden="true"
      >
        {initial}
      </div>

      <div className="max-w-[70%]">
        <p className="text-xs text-accent-500 dark:text-accent-400 font-medium mb-0.5 ml-1">{senderName}</p>
        <div
          className="
            bg-white border border-neutral-100 text-neutral-900
            dark:bg-[#253248] dark:text-neutral-100 dark:border-neutral-700
            px-4 py-2.5
            rounded-[18px_18px_18px_4px]
            text-sm leading-relaxed
            shadow-[0_1px_2px_rgba(0,0,0,0.12)]
          "
        >
          <p className="break-words whitespace-pre-wrap">{escapeHtml(message.content)}</p>
          <div className="flex items-center justify-end mt-1">
            <time className="text-[10px] text-neutral-400">{time}</time>
          </div>
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
