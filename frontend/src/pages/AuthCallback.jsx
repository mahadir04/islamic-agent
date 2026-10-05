import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Browser } from '@capacitor/browser';
import { getCurrentUser } from '../api';

const parseJwtPayload = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    const email = parsed.sub || parsed.email || '';
    const name = parsed.name || (email ? email.split('@')[0] : 'Muslim Seeker');
    return {
      email,
      name,
      picture: parsed.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=00b875`,
      settings: { theme: 'dark', location: 'Dhaka, Bangladesh' }
    };
  } catch (e) {
    return null;
  }
};

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      Browser.close().catch(() => {});
    } catch (_) {}

    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash || '';
    const hashQuery = hash.includes('?') ? hash.split('?')[1] : '';
    const hashParams = new URLSearchParams(hashQuery);
    
    const token = searchParams.get('token') || hashParams.get('token');
    const error = searchParams.get('error') || hashParams.get('error');

    if (token) {
      localStorage.setItem('token', token);
      const fallbackUser = parseJwtPayload(token);
      if (fallbackUser) {
        localStorage.setItem('user', JSON.stringify(fallbackUser));
      }
      getCurrentUser()
        .then((userData) => {
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
          }
          navigate('/dashboard');
        })
        .catch(() => {
          navigate('/dashboard');
        });
    } else if (error) {
      navigate(`/login?error=${error}`);
    } else {
      navigate('/login?error=no_token');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06090e]">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center animate-float">
          <span className="text-3xl">🕌</span>
        </div>
        <div className="flex justify-center space-x-1.5 mb-3">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
        <p className="text-emerald-400 font-medium text-sm">Completing authentication & loading Dashboard…</p>
      </div>
    </div>
  );
}