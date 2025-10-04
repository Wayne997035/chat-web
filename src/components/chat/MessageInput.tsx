import { useState, type KeyboardEvent } from 'react';
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

  const handleSend = () => {
    if (!content.trim()) return;

    try {
      const sanitized = sanitizeInput(content);
      validateMessage(sanitized);
      onSend(sanitized);
      setContent('');
      setError('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
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

