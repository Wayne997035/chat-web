import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Login = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useChatStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('請輸入用戶名稱');
      return;
    }

    if (!password.trim()) {
      setError('請輸入密碼');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (password.length >= 4) {
        setCurrentUser(username);
        sessionStorage.setItem('chatapp_user', username);
        sessionStorage.setItem('chatapp_token', 'mock_token_' + Date.now());
        navigate('/');
      } else {
        setError('密碼至少需要 4 個字元');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="
      min-h-screen
      bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600
      flex items-center justify-center
      p-4
      relative overflow-hidden
    ">
      {/* Background decorative blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-accent-500/10 blur-[120px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-accent-500/10 blur-[120px] pointer-events-none" aria-hidden="true" />

      {/* Card */}
      <div className="
        relative z-10
        w-full max-w-[400px]
        bg-white dark:bg-neutral-800
        rounded-2xl
        shadow-[0_25px_50px_rgba(14,27,74,0.25)]
        px-8 py-10
      ">
        {/* Logo area */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.png"
            alt="ChatOwl"
            className="w-[72px] h-[72px] rounded-2xl mb-3 shadow-md"
          />
          <h1 className="text-[28px] font-bold text-neutral-900 dark:text-neutral-100">
            ChatOwl
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            歡迎回來，請登入您的帳號
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {error && (
            <div
              className="
                flex items-center gap-2 px-4 py-3
                bg-error-100 dark:bg-error-500/15
                border border-error-500/30
                rounded-lg text-sm text-error-500
              "
              role="alert"
            >
              {error}
            </div>
          )}

          <Input
            id="username"
            label="用戶名稱"
            type="text"
            autoComplete="username"
            placeholder="請輸入用戶名稱"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />

          <Input
            id="password"
            label="密碼"
            type="password"
            autoComplete="current-password"
            placeholder="請輸入密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="w-full mt-2"
          >
            登入
          </Button>
        </form>

        {/* Switch to register */}
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
          還沒有帳號？
          <Link
            to="/register"
            className="text-accent-500 hover:text-accent-600 font-semibold ml-1 focus-visible:outline-none focus-visible:underline"
          >
            立即註冊
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
