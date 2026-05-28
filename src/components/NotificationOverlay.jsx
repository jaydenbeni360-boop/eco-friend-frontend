import { motion, AnimatePresence } from 'framer-motion';
import { useMobile } from '../context/MobileContext';
import { Truck, X, Award, CheckCircle } from 'lucide-react';

const NotificationOverlay = () => {
  const { notifications, removeNotification } = useMobile();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'award':
        return <Award className="w-5 h-5 text-amber-500" />;
      default:
        return <Truck className="w-5 h-5 text-primary" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50';
      case 'award':
        return 'bg-amber-50';
      default:
        return 'bg-emerald-50';
    }
  };

  return (
    <div className="absolute top-6 left-0 w-full px-5 z-[100] pointer-events-none flex flex-col gap-3">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="glass-alert p-4 pointer-events-auto flex items-start gap-3.5 relative overflow-hidden rounded-2xl border border-white/80 shadow-[0_15px_30px_rgba(0,0,0,0.06)]"
          >
            {/* Animated Progress Time Bar */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              onAnimationComplete={() => removeNotification(notif.id)}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-emerald-500 opacity-60"
            />

            <div className={`p-2.5 ${getIconBg(notif.type)} rounded-xl`}>
              {getIcon(notif.type)}
            </div>

            <div className="flex-grow pr-3">
              <h4 className="font-bold text-xs.5 text-slate-800 leading-snug">{notif.title}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
            </div>

            <button 
              onClick={() => removeNotification(notif.id)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer self-start"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationOverlay;
