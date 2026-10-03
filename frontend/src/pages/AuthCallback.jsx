import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (token) {
      localStorage.setItem('token', token);
      setTimeout(() => { window.location.href = '/dashboard'; }, 100);
    } else if (error) {
      navigate(`/login?error=${error}`);
    } else {
      navigate('/login?error=no_token');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c10]">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center animate-float">
          <span className="text-3xl">🕌</span>
        </div>
        <div className="flex justify-center space-x-1.5 mb-3">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
        <p className="text-gray-500 text-sm">Completing authentication…</p>
      </div>
    </div>
  );
}