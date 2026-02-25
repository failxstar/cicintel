import React from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Zap, Code, Users, Target } from 'lucide-react';

const SIHBackground: React.FC = () => {
  const features = [
    { icon: Award, label: "Innovation" },
    { icon: Trophy, label: "Excellence" },
    { icon: Zap, label: "Impact" },
    { icon: Code, label: "Technology" },
    { icon: Users, label: "Community" },
    { icon: Target, label: "Solution" }
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 hidden md:block">
      {/* Main SIH 2025 Branding */}
      <motion.div 
        className="absolute top-10 left-10 text-white/20"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        
        {/* <div className="text-sm uppercase tracking-wide mt-2">Smart India Hackathon</div> */}
      </motion.div>

      

      {/* Animated Lines */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{
              top: `${20 + i * 15}%`,
              left: '-100%',
              width: '200%',
            }}
            animate={{
              x: ['0%', '100%'],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              repeatType: "loop",
              delay: i * 1.5,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SIHBackground;