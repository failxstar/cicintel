import React from 'react';
import { Brain, MapPin, Mic, Building2, BarChart3, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface TechShowcaseProps {
  language: string;
}

export function TechShowcase({ language }: TechShowcaseProps) {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Classification',
      description: 'Automatically detects issue type with 90%+ accuracy using advanced computer vision',
      color: 'bg-purple-50 text-purple-700',
      iconColor: 'text-purple-600'
    },
    {
      icon: MapPin,
      title: 'Smart GPS Tagging',
      description: 'Precise location detection with automatic ward and district identification',
      color: 'bg-blue-50 text-blue-700',
      iconColor: 'text-blue-600'
    },
    {
      icon: Mic,
      title: 'Voice Recognition',
      description: 'Multi-language voice notes with real-time transcription support',
      color: 'bg-green-50 text-green-700',
      iconColor: 'text-green-600'
    },
    {
      icon: Building2,
      title: 'Department Routing',
      description: 'Intelligent routing to appropriate municipal departments based on issue type',
      color: 'bg-orange-50 text-orange-700',
      iconColor: 'text-orange-600'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Live dashboard with issue trends, resolution metrics, and performance insights',
      color: 'bg-cyan-50 text-cyan-700',
      iconColor: 'text-cyan-600'
    },
    {
      icon: Shield,
      title: 'Tamper Detection',
      description: 'AI-based verification system to prevent fake reports and ensure data integrity',
      color: 'bg-red-50 text-red-700',
      iconColor: 'text-red-600'
    }
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-primary mb-2">Technology Features</h2>
        <p className="text-sm text-muted-foreground">
          Powered by AI and Smart City Technologies
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-4 ${feature.color}`}>
              <div className="flex items-start gap-3">
                <feature.icon className={`w-6 h-6 ${feature.iconColor} flex-shrink-0 mt-1`} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs opacity-80 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center pt-4">
        <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50">
          Powered by team The Black Pearl
        </Badge>
      </div>
    </div>
  );
}