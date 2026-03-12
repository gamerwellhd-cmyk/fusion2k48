import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Coffee, Repeat2, AlertCircle } from 'lucide-react';
import { playerService } from '../services/playerService';
import { RESTART_TOKEN_COST } from '../constants';

interface RestartShopProps {
  username: string;
  coins: number;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (tokens: number) => void;
}

export const RestartShop: React.FC<RestartShopProps> = ({
  username,
  coins,
  isOpen,
  onClose,
  onPurchase,
}) => {
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const totalCost = selectedQuantity * RESTART_TOKEN_COST;
  const canAfford = coins >= totalCost;

  const handlePurchase = () => {
    setPurchaseStatus('loading');

    setTimeout(() => {
      if (playerService.buyRestartTokens(username, selectedQuantity)) {
        setPurchaseStatus('success');
        onPurchase(selectedQuantity);

        setTimeout(() => {
          setPurchaseStatus('idle');
          onClose();
          setSelectedQuantity(1);
        }, 1500);
      } else {
        setPurchaseStatus('error');

        setTimeout(() => {
          setPurchaseStatus('idle');
        }, 2000);
      }
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4"
          >
            <div className="bg-petrol-900/95 border-2 border-petrol-700/50 rounded-[32px] p-6 sm:p-8 backdrop-blur-md shadow-2xl">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors opacity-60 hover:opacity-100"
              >
                <X size={20} className="text-petrol-300" />
              </button>

              {/* Title */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-petrol-600 rounded-[16px] flex items-center justify-center">
                  <ShoppingCart size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Restart Shop</h2>
                  <p className="text-xs text-petrol-300 font-mono uppercase tracking-widest">Compre restarts com café</p>
                </div>
              </div>

              {/* Current Balance */}
              <div className="mb-6 p-4 bg-orange-900/20 border border-orange-700/30 rounded-[20px]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-300 font-mono uppercase">Seu Café:</span>
                  <div className="flex items-center gap-2">
                    <Coffee size={16} className="text-orange-300" />
                    <span className="text-lg font-black text-orange-300">{coins}</span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-xs font-mono uppercase opacity-60 text-petrol-300 mb-3">
                  Quantidade
                </label>
                <div className="flex gap-2">
                  {[1, 3, 5].map(qty => (
                    <motion.button
                      key={qty}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedQuantity(qty)}
                      className={`flex-1 py-3 rounded-[16px] font-black text-sm transition-all border-2 ${
                        selectedQuantity === qty
                          ? 'bg-petrol-600 border-petrol-500 text-white'
                          : 'bg-petrol-800/40 border-petrol-700/30 text-petrol-300 hover:border-petrol-600/50'
                      }`}
                    >
                      {qty}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mb-6 p-4 bg-petrol-800/30 border border-petrol-700/30 rounded-[20px] space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-petrol-300">Custo por restart:</span>
                  <div className="flex items-center gap-1">
                    <Coffee size={14} className="text-orange-300" />
                    <span className="font-bold text-orange-300">{RESTART_TOKEN_COST}</span>
                  </div>
                </div>
                <div className="h-px bg-petrol-700/20" />
                <div className="flex items-center justify-between text-base font-bold">
                  <span className="text-white">Total:</span>
                  <div className="flex items-center gap-1">
                    <Coffee size={16} className={totalCost > coins ? 'text-red-400' : 'text-orange-300'} />
                    <span className={totalCost > coins ? 'text-red-400' : 'text-orange-300'}>{totalCost}</span>
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {purchaseStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-[16px] flex items-center gap-2 text-red-300 text-sm"
                >
                  <AlertCircle size={16} />
                  Café insuficiente!
                </motion.div>
              )}

              {purchaseStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded-[16px] text-green-300 text-sm font-bold text-center"
                >
                  ✦ Compra realizada!
                </motion.div>
              )}

              {/* Purchase Button */}
              <motion.button
                whileHover={canAfford ? { scale: 1.02 } : {}}
                whileTap={canAfford ? { scale: 0.98 } : {}}
                onClick={handlePurchase}
                disabled={!canAfford || purchaseStatus !== 'idle'}
                className={`w-full py-4 rounded-[20px] font-black text-lg uppercase tracking-tight transition-all border-b-4 flex items-center justify-center gap-2 ${
                  canAfford && purchaseStatus === 'idle'
                    ? 'bg-petrol-600 hover:bg-petrol-500 border-petrol-800 text-white cursor-pointer'
                    : 'bg-petrol-700/40 border-petrol-800/40 text-petrol-400 cursor-not-allowed opacity-50'
                }`}
              >
                {purchaseStatus === 'loading' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ShoppingCart size={20} />
                  </motion.div>
                )}
                {purchaseStatus === 'success' ? '✓ Comprado!' : 'Comprar'}
              </motion.button>

              {!canAfford && (
                <p className="text-xs text-red-300 text-center mt-3 font-mono">
                  Faltam {totalCost - coins} café para essa compra
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
