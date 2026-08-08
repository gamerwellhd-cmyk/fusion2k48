import React, { useEffect, useState, Suspense } from 'react';
import LoadingSpinner from './core/ui/LoadingSpinner';

const SplashScreen = React.lazy(() => import('./features/splash/components/SplashScreen'));
const GameBoard = React.lazy(() => import('./features/game/components/GameBoard'));
const Leaderboard = React.lazy(() => import('./features/leaderboard/components/Leaderboard'));

type Route = '/' | '/play' | '/leaderboard';

const getRouteFromLocation = (): Route => {
  const hash = (window.location.hash || '').replace(/^#/, '') || '/';
  if (hash === '/play') return '/play';
  if (hash === '/leaderboard') return '/leaderboard';
  return '/';
};

export default function AppRouter() {
  const [route, setRoute] = useState<Route>(getRouteFromLocation());
  const [username, setUsername] = useState('');

  useEffect(() => {
    const onHash = () => setRoute(getRouteFromLocation());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (to: Route) => {
    const target = to === '/' ? '/' : to;
    if ((window.location.hash || '').replace(/^#/, '') !== target) {
      window.location.hash = target;
    } else {
      setRoute(target);
    }
  };

  const handleStart = (name: string) => {
    setUsername(name);
    navigate('/play');
  };

  const handleBack = () => navigate('/');

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="min-h-screen bg-petrol-950">
        {route === '/' && (
          <SplashScreen onStart={handleStart} onViewLeaderboard={() => navigate('/leaderboard')} />
        )}

        {route === '/play' && (
          <GameBoard username={username} onBackToMenu={handleBack} />
        )}

        {route === '/leaderboard' && (
          <Leaderboard onBack={handleBack} />
        )}
      </div>
    </Suspense>
  );
}
