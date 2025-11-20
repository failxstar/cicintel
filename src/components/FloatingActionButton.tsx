import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Camera, Mic, MapPin, X } from 'lucide-react';
import { Button } from './ui/button';

interface FloatingActionButtonProps {
  onReportClick: () => void;
  onQuickPhotoClick: () => void;
  isVisible: boolean;
}

export function FloatingActionButton({ 
  onReportClick, 
  onQuickPhotoClick, 
  isVisible 
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    {
      icon: Camera,
      label: 'Quick Photo',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => {
        onQuickPhotoClick();
        setIsExpanded(false);
      }
    },
    {
      icon: Mic,
      label: 'Voice Report',
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => {
        onReportClick();
        setIsExpanded(false);
      }
    },
    {
      icon: MapPin,
      label: 'Location Issue',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => {
        onReportClick();
        setIsExpanded(false);
      }
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-4 z-40">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-4 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="bg-black/80 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap">
                  {action.label}
                </span>
                <Button
                  size="sm"
                  className={`w-12 h-12 rounded-full shadow-lg ${action.color} text-white border-0`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          size="lg"
          className={`w-14 h-14 rounded-full shadow-xl border-0 text-white transition-all duration-200 ${
            isExpanded 
              ? 'bg-red-500 hover:bg-red-600 rotate-45' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
          }`}
          onClick={() => isExpanded ? setIsExpanded(false) : setIsExpanded(true)}
        >
          {isExpanded ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </Button>
      </motion.div>
    </div>
  );
}