import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      console.log('Auth callback - token:', token ? 'Present' : 'Not present');

      if (token) {
        // Store token in localStorage
        localStorage.setItem('token', token);
        console.log('Token stored successfully');
        
        // Small delay to ensure token is stored
        setTimeout(() => {
          navigate('/');
        }, 100);
      } else if (error) {
        console.error('Auth error:', error);
        navigate(`/login?error=${error}`);
      } else {
        console.log('No token or error received');
        navigate('/login?error=no_token');
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}