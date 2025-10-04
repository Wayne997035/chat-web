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
  const lastSentContentRef = useRef('');

  const handleSend = (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) return;
    if (isSendingRef.current) return;
    
    // 防止重複送出相同內容
    if (trimmedContent === lastSentContentRef.current) {
      return;
    }

    isSendingRef.current = true;
    lastSentContentRef.current = trimmedContent;
    
    try {
      const sanitized = sanitizeInput(trimmedContent);
      validateMessage(sanitized);
      
      // 立即清空輸入框（同步）
      setContent('');
      setError('');
      
      // 呼叫發送（可能是異步）
      onSend(sanitized);
      
      // 短暫延遲後解鎖和重置
      setTimeout(() => {
        isSendingRef.current = false;
        lastSentContentRef.current = '';
      }, 500);
    } catch (err) {
      // 錯誤時立即解鎖和重置
      isSendingRef.current = false;
      lastSentContentRef.current = '';
      
      if (err instanceof Error) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSend(e);
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

