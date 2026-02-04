
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  mockUsers: User[];
}

/**
 * 專用的驗證碼輸入組件
 */
const VerificationCodeInput: React.FC<{
  code: string[];
  onChange: (newCode: string[]) => void;
  disabled?: boolean;
}> = ({ code, onChange, disabled }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (idx: number, value: string) => {
    if (disabled) return;
    // 僅允許數字
    const val = value.replace(/[^0-9]/g, '');
    if (!val && value !== '') return;

    const newCode = [...code];
    // 處理貼上多位數的情況
    if (val.length > 1) {
      const pasted = val.split('').slice(0, 6);
      pasted.forEach((char, i) => {
        if (idx + i < 6) newCode[idx + i] = char;
      });
      onChange(newCode);
      const nextIdx = Math.min(idx + pasted.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    newCode[idx] = val;
    onChange(newCode);

    // 自動跳轉
    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      // 退格且當前格為空時，跳回前一格
      inputRefs.current[idx - 1]?.focus();
    }
  };

  return (
    <div className={`flex justify-between gap-2 transition-opacity ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {code.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => { inputRefs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={digit}
          disabled={disabled}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onChange={(e) => handleInput(idx, e.target.value)}
          className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white/10"
        />
      ))}
    </div>
  );
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, mockUsers }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [verifyCode, setVerifyCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || (isSignUp && !nickname)) {
      setError('請填寫所有欄位');
      return;
    }

    setLoading(true);
    // 模擬驗證與 API 延遲
    setTimeout(() => {
      if (isSignUp) {
        setIsVerifying(true);
      } else {
        // 登入邏輯
        const existingUser = mockUsers.find(u => u.name.toLowerCase() === email.toLowerCase());
        if (existingUser) {
          onLogin(existingUser);
        } else {
          onLogin({
            id: `u-${Date.now()}`,
            name: email.split('@')[0],
            points: 1000,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            cooldownUntil: null
          });
        }
      }
      setLoading(false);
    }, 1200);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // 模擬驗證碼核對
    setTimeout(() => {
      const newUser: User = {
        id: `u-${Date.now()}`,
        name: nickname,
        points: 1000,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname}`,
        cooldownUntil: null
      };
      onLogin(newUser);
      setLoading(false);
    }, 1500);
  };

  if (isVerifying) {
    return (
      <div className="fixed inset-0 z-[100] bg-gray-950 flex items-center justify-center p-4">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full"></div>
        <div className="w-full max-w-md relative">
          <div className="bg-gray-900/60 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-black text-white mb-2 tracking-tight">驗證您的電子信箱</h1>
              <p className="text-gray-400 text-sm">我們已將 6 位數驗證碼發送至<br/><span className="text-blue-400 font-medium">{email}</span></p>
            </div>

            <form onSubmit={handleVerify} className={`space-y-8 animate-in fade-in zoom-in-95 duration-300 ${loading ? 'opacity-70 pointer-events-none' : ''}`}>
              <VerificationCodeInput code={verifyCode} onChange={setVerifyCode} disabled={loading} />

              <button
                disabled={loading || verifyCode.some(d => !d)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>正在驗證...</span>
                  </>
                ) : (
                  '完成驗證'
                )}
              </button>

              <div className="text-center space-y-4">
                <button 
                  type="button" 
                  disabled={loading}
                  className="text-sm text-gray-500 hover:text-white transition-colors disabled:opacity-30"
                >
                  沒收到驗證碼？ <span className="text-blue-400 font-bold">重新發送</span>
                </button>
                <div className="block">
                  <button 
                    type="button" 
                    disabled={loading}
                    onClick={() => { setIsVerifying(false); setVerifyCode(['','','','','','']); }} 
                    className="text-xs text-gray-600 hover:text-gray-400 disabled:opacity-30"
                  >
                    返回修改註冊資訊
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full"></div>
      
      <div className="w-full max-w-md relative">
        <div className="bg-gray-900/60 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 opacity-50"></div>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center font-black text-white text-3xl italic mx-auto mb-4 shadow-lg shadow-blue-500/20">
              QS
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">任務星域</h1>
            <p className="text-gray-400 text-sm">
              {isSignUp ? '建立你的冒險者帳號' : '登入以繼續你的旅程'}
            </p>
          </div>

          <form onSubmit={handleAuth} className={`space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${loading ? 'opacity-70 pointer-events-none' : ''}`}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl text-red-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">冒險者暱稱</label>
                <input
                  required
                  disabled={loading}
                  type="text"
                  placeholder="例如：王小明"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">電子信箱</label>
              <input
                required
                disabled={loading}
                type="email"
                placeholder="quest@sphere.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">密碼</label>
              <input
                required
                disabled={loading}
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <button type="button" disabled={loading} className="text-[10px] text-gray-500 hover:text-blue-400 uppercase tracking-tighter transition-colors disabled:opacity-30">忘記密碼？</button>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/10 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>處理中...</span>
                </>
              ) : (
                isSignUp ? '發送驗證郵件' : '登入星域'
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-30"
              >
                {isSignUp ? (
                  <>已經有帳號了？ <span className="text-blue-400 font-bold ml-1">返回登入</span></>
                ) : (
                  <>還沒有帳號？ <span className="text-purple-400 font-bold ml-1">立即註冊</span></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
