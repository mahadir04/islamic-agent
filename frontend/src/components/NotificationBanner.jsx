import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotificationBanner() {
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleNoorAlert = (e) => {
      const detail = e.detail;
      setAlert(detail);

      // Auto dismiss after 6 seconds
      const timer = setTimeout(() => {
        setAlert(prev => (prev?.id === detail.id ? null : prev));
      }, 6000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('noor:alert', handleNoorAlert);
    return () => window.removeEventListener('noor:alert', handleNoorAlert);
  }, []);

  if (!alert) return null;

  return (
    <aside
      aria-label="Spiritual Alert Notification"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md animate-slide-down"
    >
      <div className="bg-[#0b121b]/95 border border-emerald-500/40 rounded-2xl p-4 backdrop-blur-xl shadow-2xl shadow-emerald-950/50 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/25 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0">
          🕌
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-white tracking-wide truncate">
              {alert.title}
            </h4>
            <span className="text-[10px] text-emerald-400 font-mono">
              {alert.timestamp || 'Now'}
            </span>
          </div>
          <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
            {alert.body}
          </p>

          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.06]">
            <button
              onClick={() => {
                setAlert(null);
                navigate('/dashboard');
              }}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition"
            >
              View Dashboard →
            </button>
            <span className="text-gray-600 text-xs">·</span>
            <button
              onClick={() => setAlert(null)}
              className="text-[11px] text-gray-400 hover:text-gray-200 transition"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={() => setAlert(null)}
          className="p-1 text-gray-400 hover:text-white rounded-lg transition shrink-0"
          aria-label="Dismiss alert"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
