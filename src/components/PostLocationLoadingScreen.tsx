import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Loader, CheckCircle } from 'lucide-react';

interface PostLocationLoadingScreenProps {
  detectedLocation: string;
}

export function PostLocationLoadingScreen({ detectedLocation }: PostLocationLoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Success Icon */}
        <motion.div 
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>

        {/* Location Detected */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Location Detected!</h2>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <MapPin className="w-5 h-5 text-green-600" />
            <span className="text-lg font-medium text-green-700">{detectedLocation}</span>
          </div>
        </motion.div>

        {/* Circular Loader */}
        <motion.div 
          className="w-8 h-8 mx-auto mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Loader className="w-8 h-8 text-green-600 animate-spin" />
        </motion.div>

        {/* Loading Messages */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p className="text-gray-600">Setting up your civic dashboard...</p>
          <p className="text-sm text-gray-500">Connecting to {detectedLocation} Municipal Corporation</p>
          <p className="text-xs text-gray-400">Loading local reports and services...</p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div 
          className="mt-8 w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <motion.div 
            className="h-full bg-green-600 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay: 1.2, duration: 2, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}