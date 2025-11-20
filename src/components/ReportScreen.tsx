import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Clock, Mic, X, Brain, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { Report, User } from '../App';
import { translations } from './translations';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { analyzeImage, AIAnalysisResult } from '../utils/aiClassification';
import { VoiceRecorder } from './VoiceRecorder';

interface ReportScreenProps {
  user: User;
  onSubmit: (report: Omit<Report, 'id' | 'timestamp' | 'upvotes' | 'comments' | 'distance' | 'hasUserUpvoted'>) => void;
  onCancel: () => void;
}

const issueTypes = [
  { value: 'road', aiTag: 'Road Issue' },
  { value: 'garbage', aiTag: 'Garbage' },
  { value: 'water', aiTag: 'Water Issue' },
  { value: 'streetlight', aiTag: 'Streetlight' },
  { value: 'drainage', aiTag: 'Drainage' },
  { value: 'other', aiTag: 'Other' }
];

export function ReportScreen({ user, onSubmit, onCancel }: ReportScreenProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string>('');
  const [issueType, setIssueType] = useState<string>('');
  const [severity, setSeverity] = useState<number[]>([5]);
  const [description, setDescription] = useState<string>('');
  const [hasVoiceNote, setHasVoiceNote] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const t = translations[user.language];

  // Trigger AI analysis when photo and description are available
  useEffect(() => {
    if (capturedPhoto && description.length > 3) {
      setIsAnalyzing(true);
      // Simulate AI processing delay
      setTimeout(() => {
        const analysis = analyzeImage(capturedPhoto, description, {
          district: user.district,
          ward: `Ward ${Math.floor(Math.random() * 20) + 1}`,
          coordinates: user.coordinates
        });
        setAiAnalysis(analysis);
        setIssueType(analysis.primaryIssue.toLowerCase());
        setSeverity([analysis.severity]);
        setIsAnalyzing(false);
      }, 1500);
    }
  }, [capturedPhoto, description, user]);

  // Simulate camera capture
  const handleCameraCapture = () => {
    // Simulate photo capture with a random Unsplash image
    const photoUrls = [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      'https://images.unsplash.com/photo-1609771405106-23d93a049d8b?w=400',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400'
    ];
    const randomPhoto = photoUrls[Math.floor(Math.random() * photoUrls.length)];
    setCapturedPhoto(randomPhoto);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!capturedPhoto || !issueType) {
      return;
    }

    const selectedIssueType = issueTypes.find(type => type.value === issueType);
    
    const newReport: Omit<Report, 'id' | 'timestamp' | 'upvotes' | 'comments' | 'distance' | 'hasUserUpvoted'> = {
      title: aiAnalysis?.primaryIssue 
        ? `${aiAnalysis.primaryIssue} issue detected` 
        : `${selectedIssueType?.aiTag} reported`,
      description: description || `${selectedIssueType?.aiTag} issue reported via Swachh Nagar`,
      imageUrl: capturedPhoto,
      district: user.district,
      ward: `Ward ${Math.floor(Math.random() * 20) + 1}`,
      street: 'Current Location Street',
      coordinates: {
        lat: user.coordinates.lat + (Math.random() - 0.5) * 0.01,
        lng: user.coordinates.lng + (Math.random() - 0.5) * 0.01
      },
      aiTag: aiAnalysis?.primaryIssue || selectedIssueType?.aiTag || 'Unknown',
      aiConfidence: aiAnalysis?.confidence || Math.floor(Math.random() * 15) + 85,
      status: 'pending' as const,
      severity: aiAnalysis?.severity || severity[0],
      type: issueType,
      userId: 'current-user',
      priority: (aiAnalysis?.priority === 'critical' ? 'high' : aiAnalysis?.priority) || (severity[0] >= 7 ? 'high' : severity[0] >= 4 ? 'medium' : 'low')
    };

    onSubmit(newReport);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('en-IN'),
      time: now.toLocaleTimeString('en-IN')
    };
  };

  const { date, time } = getCurrentDateTime();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b sticky top-8 z-40">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            {t.cancel}
          </Button>
          <h1 className="text-lg text-primary">{t.report}</h1>
          <div></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Camera Section */}
        <div>
          <label className="block text-sm mb-2">{t.capturePhoto} *</label>
          <div className="relative">
            {!capturedPhoto ? (
              <motion.div
                className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                onClick={handleCameraCapture}
                whileTap={{ scale: 0.98 }}
              >
                <Camera className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">{t.capturePhoto}</p>
              </motion.div>
            ) : (
              <div className="relative aspect-video">
                <ImageWithFallback
                  src={capturedPhoto}
                  alt="Captured photo"
                  className="w-full h-full object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setCapturedPhoto('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* AI Analysis Section */}
        {(aiAnalysis || isAnalyzing) && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">AI Analysis</h3>
              {isAnalyzing && (
                <div className="animate-pulse text-sm text-blue-600">Processing...</div>
              )}
            </div>
            
            {isAnalyzing ? (
              <div className="space-y-2">
                <div className="animate-pulse bg-blue-200 h-4 rounded w-3/4"></div>
                <div className="animate-pulse bg-blue-200 h-4 rounded w-1/2"></div>
                <div className="animate-pulse bg-blue-200 h-4 rounded w-2/3"></div>
              </div>
            ) : aiAnalysis && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`text-xs ${
                      aiAnalysis.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      aiAnalysis.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      aiAnalysis.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}
                  >
                    {aiAnalysis.priority.toUpperCase()} PRIORITY
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {aiAnalysis.confidence}% confidence
                  </span>
                </div>
                
                <div className="text-sm space-y-1">
                  <p><strong>Detected:</strong> {aiAnalysis.primaryIssue}</p>
                  <p><strong>Department:</strong> {aiAnalysis.suggestedDepartment}</p>
                  <p><strong>Est. Resolution:</strong> {aiAnalysis.estimatedResolutionTime}</p>
                </div>
                
                {aiAnalysis.riskFactors.length > 0 && (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <strong>Risk Factors:</strong>
                      <ul className="text-gray-600 mt-1">
                        {aiAnalysis.riskFactors.map((risk, index) => (
                          <li key={index}>• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {aiAnalysis.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {aiAnalysis.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Auto-filled Location & Time */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{t.location}:</span>
            <span>{user.district}, {user.coordinates.lat.toFixed(4)}, {user.coordinates.lng.toFixed(4)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">Time:</span>
            <span>{date} {time}</span>
          </div>
        </div>

        {/* Issue Type */}
        <div>
          <label className="block text-sm mb-2">{t.issueType} *</label>
          <Select value={issueType} onValueChange={setIssueType}>
            <SelectTrigger>
              <SelectValue placeholder={`${t.issueType}...`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="road">{t.road}</SelectItem>
              <SelectItem value="garbage">{t.garbage}</SelectItem>
              <SelectItem value="water">{t.water}</SelectItem>
              <SelectItem value="streetlight">{t.streetlight}</SelectItem>
              <SelectItem value="drainage">Drainage</SelectItem>
              <SelectItem value="other">{t.other}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Severity Slider */}
        <div>
          <label className="block text-sm mb-2">
            {t.severity}: {severity[0]}/10
          </label>
          <Slider
            value={severity}
            onValueChange={setSeverity}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm mb-2">
            {t.description} {!aiAnalysis && capturedPhoto && (
              <span className="text-blue-600 text-xs">• Add description for AI analysis</span>
            )}
          </label>
          <Textarea
            placeholder={`${t.description}...`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Voice Note */}
        <div>
          <label className="block text-sm mb-2">
            {t.recordVoiceNote} ({t.optional})
          </label>
          <VoiceRecorder 
            onRecordingComplete={setHasVoiceNote}
            language={user.language}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={!capturedPhoto || !issueType}
        >
          {user.isOnline ? t.submit : `${t.submit} (${t.savedOffline})`}
        </Button>
      </form>
    </div>
  );
}