import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginDemo, 
  getBaseUrl, 
  isNativeApp 
} from '../api';

export default function Login({ isDarkMode, onLoginSuccess }) {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If already logged in, navigate straight to dashboard
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash || '';
    const hashQuery = hash.includes('?') ? hash.split('?')[1] : '';
    const hashParams = new URLSearchParams(hashQuery);
    const err = searchParams.get('error') || hashParams.get('error');

    if (!err) return;
    const msgs = {
      auth_failed: 'Authentication failed. Please try again.',
      access_denied: 'Access was denied. Please try again.',
      token_exchange_failed: 'Failed to authenticate with Google.',
      no_code: 'No authorization code received.',
      oauth_not_configured: 'OAuth is not configured.'
    };
    setError(msgs[err] || `Authentication error: ${err}`);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        data = await registerWithEmail(email, password, name);
      } else {
        data = await loginWithEmail(email, password);
      }

      if (data?.token) {
        if (onLoginSuccess) onLoginSuccess(data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setError(detail || (isRegister ? 'Failed to create account.' : 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await loginDemo();
      if (data?.token) {
        if (onLoginSuccess) onLoginSuccess(data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError("Cannot connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setError(null);
    let backendUrl = getBaseUrl().replace(/\/$/, "");
    if (backendUrl.endsWith("/api")) {
      backendUrl = backendUrl.slice(0, -4);
    }
    const isMobile = isNativeApp();
    const targetUrl = `${backendUrl}/api/auth/google${isMobile ? '?platform=mobile' : ''}`;
    
    if (isMobile) {
      // In native mobile app, open the system browser for Google OAuth
      window.open(targetUrl, '_system');
      setLoading(false);
      return;
    }
    window.location.href = targetUrl;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#070a0e] text-gray-100"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}
    >
      {/* ── Main Split Modal / Card ── */}
      <div className="w-full max-w-4xl bg-[#090e15] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* ── Left Side: Spiritual Branding Banner ── */}
        <div className="md:w-1/2 p-8 md:p-12 relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0c141d] via-[#091018] to-[#060a0f] border-b md:border-b-0 md:border-r border-white/[0.06]">
          {/* Subtle architectural arched backdrop glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-500/5 rounded-full blur-[80px] pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
              </svg>
            </div>
            <span className="font-semibold text-lg tracking-tight font-serif-luxury text-white">
              Noor AI
            </span>
          </div>

          {/* Middle Typography & Copy */}
          <div className="relative z-10 my-10 space-y-4">
            <h2 className="text-3xl md:text-4xl font-serif-luxury font-medium text-emerald-400 leading-tight">
              Light for your spiritual heart.
            </h2>
            <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-sm">
              Experience a new way to connect with Islamic knowledge through personalized guidance and modern spiritual tools.
            </p>
          </div>

          {/* Bottom Feature Badges */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-200">
                Personalized AI Spiritual Advisor
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-200">
                Smart Quran Explorer & Tafsir
              </span>
            </div>
          </div>
        </div>

        {/* ── Right Side: Welcome Back / Sign In Form ── */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[#070b10]">
          <div className="max-w-sm mx-auto w-full">
            
            {/* Header */}
            <div className="mb-7">
              <h3 className="text-2xl font-serif-luxury font-medium text-white mb-1.5">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-gray-400">
                {isRegister ? 'Start your spiritual journey today.' : 'Enter your details to continue your journey.'}
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isRegister && (
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0c1219] border border-white/[0.08] focus:border-emerald-500/60 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition shadow-inner"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0c1219] border border-white/[0.08] focus:border-emerald-500/60 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition shadow-inner"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                    Password
                  </label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => alert("Password reset link will be sent to your email.")}
                      className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 hover:text-emerald-300 transition"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#0c1219] border border-white/[0.08] focus:border-emerald-500/60 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-lg shadow-emerald-900/30 transition transform active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? 'Please wait...' : (isRegister ? 'Start journey for free' : 'Sign In')}
              </button>

              {/* Quick Demo Sign-In Button */}
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium text-xs flex items-center justify-center gap-2 transition active:scale-[0.99]"
              >
                <span>⚡</span>
                <span>Quick Demo Sign-In (Instant Access)</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]" />
              </div>
              <span className="relative px-3 bg-[#070b10] text-[10px] uppercase font-bold tracking-wider text-gray-500">
                Or continue with
              </span>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0c1219] hover:bg-[#111a24] border border-white/[0.08] hover:border-white/[0.15] text-xs font-medium text-gray-200 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={() => alert("Apple ID sign in is coming soon.")}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0c1219] hover:bg-[#111a24] border border-white/[0.08] hover:border-white/[0.15] text-xs font-medium text-gray-200 transition"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.05-1.83.93-2.9-.9.04-2 .6-2.65 1.36-.58.67-1.08 1.76-.94 2.81 1.01.08 2.03-.51 2.66-1.27z" />
                </svg>
                Apple
              </button>
            </div>

            {/* Toggle sign up / sign in */}
            <div className="mt-6 text-center">
              <span className="text-xs text-gray-500">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                }}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
              >
                {isRegister ? 'Sign in' : 'Start journey for free'}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}