import React from 'react';
import { PhoneCall } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function EmergencyFloatingButton() {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate('/emergency-guide')}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-lg hover:shadow-xl focus:outline-none"
    >
      <div className="absolute inset-0 rounded-full bg-red-500 animate-pulse-ring opacity-50"></div>
      <PhoneCall size={24} className="relative z-10" />
    </motion.button>
  );
}
