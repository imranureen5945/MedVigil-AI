import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export default function AlertCard({ type = 'warning', icon: Icon, title, description, action }) {
  const styles = {
    critical: {
      border: 'border-l-red-500',
      bg: 'bg-red-50',
      text: 'text-red-800',
      desc: 'text-red-600',
      defaultIcon: <ShieldAlert className="text-red-500" size={24} />
    },
    warning: {
      border: 'border-l-orange-500',
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      desc: 'text-orange-700',
      defaultIcon: <AlertTriangle className="text-orange-500" size={24} />
    },
    safe: {
      border: 'border-l-green-500',
      bg: 'bg-green-50',
      text: 'text-green-800',
      desc: 'text-green-700',
      defaultIcon: <Info className="text-green-500" size={24} />
    }
  };

  const style = styles[type] || styles.warning;
  const DisplayIcon = Icon ? <Icon className={style.defaultIcon.props.className} size={24} /> : style.defaultIcon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-card shadow-subtle border border-gray-100 ${style.bg}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.border}`}></div>
      <div className="p-4 sm:p-5 flex items-start gap-4 ml-1">
        <div className="shrink-0 mt-1">{DisplayIcon}</div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-base font-semibold ${style.text} mb-1`}>{title}</h4>
          <p className={`text-sm ${style.desc}`}>{description}</p>
        </div>
        {action && (
          <div className="shrink-0 ml-4">
            {action}
          </div>
        )}
      </div>
    </motion.div>
  );
}
