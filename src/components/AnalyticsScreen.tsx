import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus, MapPin, Clock, Users, CheckCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { motion } from 'motion/react';
import { Report, User } from '../App';
import { translations } from './translations';
import { generateInsights } from '../utils/aiClassification';

interface AnalyticsScreenProps {
  reports: Report[];
  user: User;
}

export function AnalyticsScreen({ reports, user }: AnalyticsScreenProps) {
  const t = translations[user.language];
  const insights = generateInsights(reports);

  const statsCards = [
    {
      title: 'Total Reports',
      value: insights.totalReports,
      icon: BarChart3,
      color: 'bg-blue-50 text-blue-700',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Resolution Rate',
      value: `${insights.resolvedPercentage}%`,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-700',
      iconColor: 'text-green-600'
    },
    {
      title: 'Avg. Resolution',
      value: insights.averageResolutionTime,
      icon: Clock,
      color: 'bg-purple-50 text-purple-700',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Active Citizens',
      value: Math.floor(insights.totalReports * 0.7),
      icon: Users,
      color: 'bg-orange-50 text-orange-700',
      iconColor: 'text-orange-600'
    }
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-green-500" />;
      default: return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  const recentActivity = reports
    .filter(r => r.district === user.district)
    .slice(0, 5)
    .map(report => ({
      ...report,
      timeAgo: Math.floor((Date.now() - report.timestamp.getTime()) / (1000 * 60))
    }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="p-4">
          <h1 className="text-xl mb-1 text-primary">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground">{user.district} District</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-4 ${stat.color}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium opacity-70">{stat.title}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Top Issue Types */}
        <Card className="p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Top Issue Types
          </h3>
          <div className="space-y-3">
            {insights.topIssueTypes.map((issue, index) => (
              <div key={issue.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{issue.type}</p>
                    <p className="text-xs text-muted-foreground">{issue.count} reports</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(issue.trend)}
                  <Badge variant="secondary" className="text-xs">
                    {Math.floor((issue.count / insights.totalReports) * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Critical Areas */}
        <Card className="p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Critical Areas
          </h3>
          <div className="space-y-3">
            {insights.criticalAreas.map((area, index) => (
              <div key={area.ward} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-red-500' : 
                    index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{area.ward}</p>
                    <p className="text-xs text-muted-foreground">Needs attention</p>
                  </div>
                </div>
                <Badge variant={index === 0 ? "destructive" : index === 1 ? "default" : "secondary"}>
                  {area.issueCount} issues
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === 'resolved' ? 'bg-green-500' :
                  activity.status === 'submitted' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.ward}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-xs ${
                      activity.priority === 'high' ? 'bg-red-100 text-red-800' :
                      activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {activity.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {activity.timeAgo}m ago
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-4">
          <h3 className="font-medium mb-4">Performance Insights</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">AI Classification Accuracy</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-[91%] h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">91%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Response Time (Target: 2 days)</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-[85%] h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">1.7d avg</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Citizen Satisfaction</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-[88%] h-2 bg-purple-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">4.4/5</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}