/**
 * LocationPermissionAlert Component
 * Displays a user-friendly alert when location permission is required or denied
 */

import React from 'react';
import { MapPin, AlertCircle, Settings, X } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';

export interface LocationPermissionAlertProps {
    type: 'required' | 'denied' | 'unavailable';
    onDismiss?: () => void;
    onRetry?: () => void;
}

export function LocationPermissionAlert({
    type,
    onDismiss,
    onRetry,
}: LocationPermissionAlertProps) {
    const getContent = () => {
        switch (type) {
            case 'required':
                return {
                    icon: <MapPin className="w-12 h-12 text-blue-500" />,
                    title: 'Location Access Required',
                    message:
                        'We need your location to help you report civic issues accurately and show nearby problems in your area.',
                    features: [
                        '📍 Pinpoint exact issue locations',
                        '🎯 Auto-fill address details',
                        '📊 See nearby reports',
                        '🚀 Faster reporting process',
                    ],
                    action: 'Enable Location',
                    color: 'blue',
                };

            case 'denied':
                return {
                    icon: <AlertCircle className="w-12 h-12 text-orange-500" />,
                    title: 'Location Permission Denied',
                    message:
                        'Location access was blocked. To use location features, please enable it in your browser settings.',
                    features: [
                        '🔧 Click the lock/settings icon in your browser address bar',
                        '📱 Allow location access for this site',
                        '🔄 Refresh the page after enabling',
                    ],
                    action: 'How to Enable',
                    color: 'orange',
                };

            case 'unavailable':
                return {
                    icon: <Settings className="w-12 h-12 text-red-500" />,
                    title: 'Location Unavailable',
                    message:
                        'We couldn\'t get your location. Please check your device GPS settings and try again.',
                    features: [
                        '📡 Enable GPS on your device',
                        '🌐 Check your internet connection',
                        '🔄 Try again in a few moments',
                    ],
                    action: 'Retry',
                    color: 'red',
                };
        }
    };

    const content = getContent();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-0 left-0 right-0 z-50 p-4 max-w-md mx-auto"
            >
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="absolute top-4 right-4 p-1 hover:bg-white/50 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        )}

                        <div className="flex flex-col items-center text-center">
                            {content.icon}
                            <h3 className="mt-4 text-xl font-bold text-gray-900">
                                {content.title}
                            </h3>
                            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                                {content.message}
                            </p>
                        </div>
                    </div>

                    {/* Features/Steps */}
                    <div className="p-6 bg-gray-50">
                        <div className="space-y-2">
                            {content.features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 text-sm text-gray-700"
                                >
                                    <span className="flex-shrink-0 w-6 text-center">
                                        {feature.split(' ')[0]}
                                    </span>
                                    <span>{feature.substring(feature.indexOf(' ') + 1)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-white border-t border-gray-200 flex gap-3">
                        {onDismiss && (
                            <Button
                                variant="outline"
                                onClick={onDismiss}
                                className="flex-1"
                            >
                                Continue Without Location
                            </Button>
                        )}
                        {onRetry && (
                            <Button
                                onClick={onRetry}
                                className={`flex-1 bg-${content.color}-500 hover:bg-${content.color}-600`}
                            >
                                {content.action}
                            </Button>
                        )}
                    </div>

                    {/* Privacy Note */}
                    <div className="px-6 py-3 bg-gray-100 text-xs text-gray-500 text-center">
                        🔒 We respect your privacy. Your location is only used to improve
                        your reporting experience.
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

/**
 * Compact Location Permission Banner (alternative design)
 */
export function LocationPermissionBanner({
    type,
    onDismiss,
    onRetry,
}: LocationPermissionAlertProps) {
    const content = {
        required: {
            icon: '📍',
            text: 'Enable location for accurate issue reporting',
            action: 'Allow',
        },
        denied: {
            icon: '⚠️',
            text: 'Location blocked. Enable in browser settings.',
            action: 'How to Enable',
        },
        unavailable: {
            icon: '📡',
            text: 'Location unavailable. Check GPS settings.',
            action: 'Retry',
        },
    }[type];

    return (
        <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
        >
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{content.icon}</span>
                    <span className="text-sm font-medium">{content.text}</span>
                </div>

                <div className="flex items-center gap-2">
                    {onRetry && (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={onRetry}
                            className="bg-white text-blue-600 hover:bg-gray-100"
                        >
                            {content.action}
                        </Button>
                    )}
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
