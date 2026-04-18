import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Register = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useChatStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('請輸入用戶名稱');
      return;
    }

    if (!email.trim()) {
      setError('請輸入電子郵件');
      return;
    }

    if (!password.trim()) {
      setError('請輸入密碼');
      return;
    }

    if (password.length < 6) {
      setError('密碼至少需要 6 個字元');
      return;
    }

    if (password !== confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      setCurrentUser(username);
      sessionStorage.setItem('chatapp_user', username);
      sessionStorage.setItem('chatapp_token', 'mock_token_' + Date.now());
      navigate('/');
      setIsLoading(false);
    }, 800);
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
            建立帳號，開始你的 ChatOwl 旅程
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
            id="email"
            label="電子郵件"
            type="email"
            autoComplete="email"
            placeholder="請輸入電子郵件"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />

          <Input
            id="password"
            label="密碼"
            type="password"
            autoComplete="new-password"
            placeholder="至少 6 個字元"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />

          <Input
            id="confirmPassword"
            label="確認密碼"
            type="password"
            autoComplete="new-password"
            placeholder="再次輸入密碼"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="w-full mt-2"
          >
            建立帳號
          </Button>
        </form>

        {/* Switch to login */}
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
          已有帳號？
          <Link
            to="/login"
            className="text-accent-500 hover:text-accent-600 font-semibold ml-1 focus-visible:outline-none focus-visible:underline"
          >
            立即登入
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
