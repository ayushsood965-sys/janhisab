import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', message, title, duration = 4000 }) => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    setToasts((prev) => [...prev, { id, type, message, title, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (options) => {
      if (typeof options === 'string') {
        addToast({ message: options });
      } else {
        addToast(options);
      }
    },
    [addToast]
  );

  toast.success = (message, title = 'Success') => addToast({ type: 'success', message, title });
  toast.error = (message, title = 'Attention') => addToast({ type: 'error', message, title });
  toast.warning = (message, title = 'Authentication Required') => addToast({ type: 'warning', message, title });
  toast.info = (message, title = 'Information') => addToast({ type: 'info', message, title });

  const getToastConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
          badgeBg: 'bg-emerald-50/90 border-emerald-200/90 text-emerald-600',
          borderColor: 'border-emerald-100/90',
        };
      case 'error':
        return {
          icon: AlertCircle,
          iconColor: 'text-rose-600',
          badgeBg: 'bg-rose-50/90 border-rose-200/90 text-rose-600',
          borderColor: 'border-rose-100/90',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
          badgeBg: 'bg-amber-50/90 border-amber-200/90 text-amber-600',
          borderColor: 'border-amber-100/90',
        };
      default:
        return {
          icon: Info,
          iconColor: 'text-violet-600',
          badgeBg: 'bg-violet-50/90 border-violet-200/90 text-violet-600',
          borderColor: 'border-violet-100/90',
        };
    }
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div
        aria-live="assertive"
        className="fixed top-6 right-6 z-[99999] flex flex-col space-y-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const config = getToastConfig(t.type);
            const Icon = config.icon;

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -22, scale: 0.92, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{
                  opacity: 0,
                  scale: 0.90,
                  y: -14,
                  filter: 'blur(4px)',
                  transition: { duration: 0.18, ease: [0.32, 0, 0.67, 0] },
                }}
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 30,
                  mass: 0.6,
                }}
                style={{ willChange: 'transform, opacity, filter' }}
                drag="x"
                dragConstraints={{ left: 0, right: 300 }}
                dragElastic={{ left: 0, right: 0.6 }}
                onDragEnd={(e, { offset, velocity }) => {
                  if (offset.x > 80 || velocity.x > 400) {
                    removeToast(t.id);
                  }
                }}
                className={`pointer-events-auto cursor-grab active:cursor-grabbing relative flex items-start space-x-3.5 p-4 rounded-2xl bg-white/95 backdrop-blur-2xl border ${config.borderColor} shadow-[0_16px_40px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.04)] select-none`}
              >
                {/* Status Icon */}
                <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${config.badgeBg}`}>
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-1">
                  {t.title && (
                    <h5 className="font-['Outfit'] font-bold text-[13.5px] text-slate-900 tracking-tight leading-snug mb-0.5">
                      {t.title}
                    </h5>
                  )}
                  <p className="text-[13px] text-slate-700 font-normal leading-relaxed break-words">
                    {t.message}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => removeToast(t.id)}
                  aria-label="Close notification"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 -mr-1 -mt-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
