import { useState, useRef, type KeyboardEvent, type FormEvent } from 'react';
import { validateMessage } from '../../utils/validation';
import { sanitizeInput } from '../../utils/sanitize';
import './MessageInput.css';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

const MessageInput = ({ onSend, disabled = false }: MessageInputProps) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const isSendingRef = useRef(false);

  const handleSend = (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) return;
    if (isSendingRef.current) return;

    isSendingRef.current = true;
    
    try {
      const sanitized = sanitizeInput(trimmedContent);
      validateMessage(sanitized);
      
      // 立即清空輸入框
      setContent('');
      setError('');
      
      // 呼叫發送
      onSend(sanitized);
      
      // 短暫延遲後解鎖
      setTimeout(() => {
        isSendingRef.current = false;
      }, 300);
    } catch (err) {
      // 錯誤時立即解鎖
      isSendingRef.current = false;
      
      if (err instanceof Error) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 使用 event.isComposing 來判斷是否在使用輸入法
    // isComposing 為 true 表示正在使用輸入法（如中文、日文等）
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      e.stopPropagation();
      handleSend();
    }
  };

  return (
    <div className="message-input-container">
      {error && <div className="input-error">{error}</div>}
      <div className="message-input">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="輸入訊息..."
          disabled={disabled}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={disabled || !content.trim()}
        >
          發送
        </button>
      </div>
    </div>
  );
};

export default MessageInput;

