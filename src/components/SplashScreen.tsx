import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, User, Trophy, Mail, Lock, Loader2, Download, X } from 'lucide-react';
import * as firebase from '../services/firebase';
import { playerService } from '../services/playerService';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SplashScreenProps {
  onStart: (username: string) => void;
  onViewLeaderboard: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStart, onViewLeaderboard }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionUsername, setSessionUsername] = useState<string | null>(null);
  const [dismissedInstall, setDismissedInstall] = useState(false);
  const { isInstallableApp, isAppInstalled, installApp } = usePWAInstall();

  useEffect(() => {
    const currentUser = firebase.getCurrentUser();

    if (!currentUser) {
      setSessionUsername(null);
      return;
    }

    firebase.getPlayerFromFirebase(currentUser.uid).then((cloudProfile) => {
      const resolvedUsername =
        (cloudProfile?.username as string | undefined) ||
        currentUser.displayName ||
        currentUser.email?.split('@')[0] ||
        'Player';

      setSessionUsername(resolvedUsername);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Informe um nickname para criar sua conta.');
        return;
      }

      if (password.length < 6) {
        setError('A senha precisa ter ao menos 6 caracteres.');
        return;
      }

      if (password !== confirmPassword) {
        setError('As senhas nao conferem.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'register') {
        const user = await firebase.signUpWithEmail(email.trim(), password, name.trim());

        playerService.savePlayerProfile({
          username: name.trim(),
          totalCoins: 50,
          restartTokens: 3,
          totalScore: 0,
          gamesPlayed: 0,
          lastPlayed: new Date().toISOString(),
        });

        onStart(user.displayName || name.trim());
        return;
      }

      const user = await firebase.signInWithEmail(email.trim(), password);
      const cloudProfile = await firebase.getPlayerFromFirebase(user.uid);
      const resolvedUsername =
        (cloudProfile?.username as string | undefined) ||
        user.displayName ||
        user.email?.split('@')[0] ||
        'Player';

      onStart(resolvedUsername);
    } catch (authError: any) {
      const errorCode = authError?.code as string | undefined;

      if (errorCode === 'auth/invalid-credential') {
        setError('E-mail ou senha invalidos.');
      } else if (errorCode === 'auth/operation-not-allowed' || errorCode === 'auth/admin-restricted-operation') {
        setError('Login por e-mail/senha nao esta habilitado no Firebase Console.');
      } else if (errorCode === 'auth/email-already-in-use') {
        setError('Este e-mail ja esta cadastrado.');
      } else if (errorCode === 'auth/invalid-email') {
        setError('Digite um e-mail valido.');
      } else {
        setError('Nao foi possivel autenticar. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen bg-petrol-950 p-6 text-zinc-100"
    >
      <motion.div
        initial={{ y: -50, scale: 0.8 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter uppercase italic mb-2 leading-none">
          2048<br /><span className="text-petrol-400">Fusion</span>
        </h1>
        <p className="font-mono text-[10px] opacity-40 uppercase tracking-[0.3em]">Advanced Strategy Engine</p>
      </motion.div>

      {/* PWA Install Prompt */}
      <AnimatePresence>
        {isInstallableApp && !isAppInstalled && !dismissedInstall && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-8 right-8 max-w-xs"
          >
            <div className="relative">
              {/* Speech bubble */}
              <div className="bg-petrol-600/95 border-2 border-petrol-500 rounded-3xl p-4 shadow-xl backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex-shrink-0"
                  >
                    <Download className="text-white" size={24} />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white mb-2">Instale o app!</p>
                    <p className="text-xs text-petrol-100 mb-3 leading-relaxed">
                      Jogue offline e acesse rápido na tela inicial do seu celular.
                    </p>
                    <button
                      onClick={() => {
                        installApp();
                        setDismissedInstall(true);
                      }}
                      className="w-full py-2 bg-white text-petrol-600 font-bold text-xs rounded-xl hover:bg-petrol-100 transition-colors"
                    >
                      Instalar agora
                    </button>
                  </div>
                  <button
                    onClick={() => setDismissedInstall(true)}
                    className="flex-shrink-0 text-petrol-200 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              {/* Arrow pointing down */}
              <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-petrol-600" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md bg-petrol-900/40 border-2 border-petrol-800/50 rounded-[32px] p-8 shadow-2xl backdrop-blur-md">
        {sessionUsername && (
          <div className="mb-4 p-3 bg-petrol-800/30 border border-petrol-700/40 rounded-2xl">
            <p className="text-[10px] font-mono uppercase tracking-widest text-petrol-300 mb-2">Sessao ativa</p>
            <button
              type="button"
              onClick={() => onStart(sessionUsername)}
              className="w-full py-3 rounded-xl bg-petrol-600/80 hover:bg-petrol-500 text-white font-bold text-sm transition-colors"
            >
              Continuar como {sessionUsername}
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-6 bg-black/20 p-1 rounded-2xl border border-petrol-800/40">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-all ${
              mode === 'login'
                ? 'bg-petrol-600 text-white'
                : 'text-petrol-300 hover:bg-white/5'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-all ${
              mode === 'register'
                ? 'bg-petrol-600 text-white'
                : 'text-petrol-300 hover:bg-white/5'
            }`}
          >
            Cadastro
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && (
            <div>
              <label className="block font-mono text-[10px] uppercase opacity-40 mb-2 ml-1 tracking-widest">Nickname</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Escolha seu nickname"
                  maxLength={15}
                  className="w-full bg-black/20 border-2 border-petrol-800/30 rounded-[20px] py-4 pl-12 pr-4 font-bold focus:outline-none focus:border-petrol-500/50 transition-all placeholder:opacity-20"
                  required={mode === 'register'}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-mono text-[10px] uppercase opacity-40 mb-2 ml-1 tracking-widest">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="w-full bg-black/20 border-2 border-petrol-800/30 rounded-[20px] py-4 pl-12 pr-4 font-bold focus:outline-none focus:border-petrol-500/50 transition-all placeholder:opacity-20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase opacity-40 mb-2 ml-1 tracking-widest">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 6 caracteres"
                className="w-full bg-black/20 border-2 border-petrol-800/30 rounded-[20px] py-4 pl-12 pr-4 font-bold focus:outline-none focus:border-petrol-500/50 transition-all placeholder:opacity-20"
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block font-mono text-[10px] uppercase opacity-40 mb-2 ml-1 tracking-widest">Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full bg-black/20 border-2 border-petrol-800/30 rounded-[20px] py-4 pl-12 pr-4 font-bold focus:outline-none focus:border-petrol-500/50 transition-all placeholder:opacity-20"
                  required={mode === 'register'}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-300 bg-red-950/30 border border-red-800/40 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex items-center justify-center gap-3 bg-petrol-600 text-white font-black py-4 rounded-[20px] border-b-4 border-petrol-800 hover:bg-petrol-500 hover:translate-y-[-2px] active:translate-y-[2px] active:border-b-0 transition-all shadow-lg shadow-petrol-900/50"
            >
              {isLoading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <Play size={24} fill="currentColor" />
              )}
              <span className="text-xl uppercase italic tracking-tighter">
                {mode === 'register' ? 'Criar conta' : 'Entrar'}
              </span>
            </button>

            <button
              type="button"
              onClick={onViewLeaderboard}
              className="flex items-center justify-center gap-3 bg-white/5 text-zinc-300 font-bold py-4 rounded-[20px] border border-white/10 hover:bg-white/10 transition-all"
            >
              <Trophy size={20} className="text-petrol-400" />
              <span className="uppercase text-xs tracking-widest">Leaderboard</span>
            </button>
          </div>
        </form>
      </div>

      <div className="mt-12 flex gap-8 opacity-20 font-mono text-[9px] uppercase tracking-widest">
        <span>Build v1.2.0</span>
        <span>Firebase Auth</span>
        <span>© 2026 Fusion Labs</span>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
