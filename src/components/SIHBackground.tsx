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
        <div className="text-3xl font-semibold">INNOVATION </div>
        <div className="text-2xl font-semibold">FOR NATION</div>
        {/* <div className="text-sm uppercase tracking-wide mt-2">Smart India Hackathon</div> */}
      </motion.div>

      {/* Floating Icons */}
      <div className="absolute inset-0">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          
          // Special positioning for Impact and Excellence
          let leftPosition, topPosition;
          
          if (feature.label === "Impact") {
            // Move Impact to bottom left corner
            leftPosition = "7%";
            topPosition = "80%";
          } else if (feature.label === "Excellence") {
            // Move Excellence a little to the left
            leftPosition = `${10 + (index * 15)}%`;
            topPosition = `${30 + (index % 2) * 40}%`;
          } else if (feature.label === "Solution") {
            // Move Solution a little to the left
            leftPosition = `${10 + (index * 16)}%`;
            topPosition = `${30 + (index % 2) * 50}%`;
          } else {
            // Default positioning for other icons
            leftPosition = `${20 + (index * 15)}%`;
            topPosition = `${30 + (index % 2) * 40}%`;
          }
          
          return (
            <motion.div
              key={feature.label}
              className="absolute text-white/10"
              style={{
                left: leftPosition,
                top: topPosition,
              }}
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                rotate: 0,
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 1.5, 
                delay: index * 0.3,
                y: {
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: index * 0.5
                }
              }}
            >
              <Icon size={40} />
              <div className="text-xs mt-1 text-center font-medium">
                {feature.label}
              </div>
            </motion.div>
          );
        })}
      </div>

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