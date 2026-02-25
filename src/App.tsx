import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { LoadingScreen } from './components/LoadingScreen';
import { PostLocationLoadingScreen } from './components/PostLocationLoadingScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { HomeScreen } from './components/HomeScreen';
import { ReportScreen } from './components/ReportScreen';
import { SmartHeatmap } from './components/SmartHeatmap';
import { ProfileScreen } from './components/ProfileScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { BottomNavigation } from './components/BottomNavigation';
import DesktopMobileNotice from './components/DesktopMobileNotice';
import SIHBackground from './components/SIHBackground';
import { translations, Language } from './components/translations';
import { dataService } from './services/dataService';
import { useGeolocation } from './hooks/useGeolocation';

export interface Report {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  media?: MediaItem[];
  district: string;
  ward: string;
  street: string;
  coordinates: { lat: number; lng: number };
  distance: number;
  timestamp: Date;
  aiTag: string;
  aiConfidence: number;
  status: 'pending' | 'acknowledged' | 'submitted' | 'resolved';
  upvotes: number;
  comments: Comment[];
  severity: number;
  type: string;
  userId?: string;
  hasUserUpvoted?: boolean;
  isTamperDetected?: boolean;
  priority?: 'high' | 'medium' | 'low';
  voiceNoteUrl?: string;  // base64 data URL of the audio recording
  voiceNoteDuration?: number;  // duration in seconds
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export interface Comment {
  id: string;
  text: string;
  timestamp: Date;
  author: string;
}

export interface User {
  coordinates: { lat: number; lng: number };  // PRIMARY: Real GPS coordinates
  district?: string;                           // OPTIONAL: For backward compatibility
  location?: {                                 // Auto-derived from GPS via reverse geocoding
    city?: string;
    state?: string;
    country?: string;
    formattedAddress?: string;
    street?: string;                           // Current street/road name
  };
  language: Language;
  isOnline: boolean;
}

export type Screen = 'onboarding' | 'home' | 'report' | 'map' | 'profile' | 'analytics';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPostLocationLoading, setIsPostLocationLoading] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [user, setUser] = useState<User>({
    coordinates: { lat: 0, lng: 0 },  // Will be set by real GPS
    language: 'english',
    isOnline: true
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // App initialization loading
  useEffect(() => {
    const initializeApp = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 3000); // 3 second loading screen
    };

    initializeApp();
  }, []);

  // Real-time GPS tracking
  const { position: gpsPosition, loading: gpsLoading, error: gpsError } = useGeolocation({
    watch: true,
    enableHighAccuracy: true
  });

  // Update user coordinates when GPS position changes
  useEffect(() => {
    if (gpsPosition) {
      console.log('[App] GPS position acquired:', {
        lat: gpsPosition.latitude,
        lng: gpsPosition.longitude,
        accuracy: gpsPosition.accuracy
      });

      setUser(prev => ({
        ...prev,
        coordinates: {
          lat: gpsPosition.latitude,
          lng: gpsPosition.longitude
        }
      }));

      // Auto-derive district and location from GPS (reverse geocoding)
      import('./services/geocodingService').then(({ reverseGeocode }) => {
        reverseGeocode(gpsPosition.latitude, gpsPosition.longitude)
          .then(result => {
            console.log('[App] Reverse geocoding result:', result);
            console.log('[App] 📍 Street name:', result.street || 'No street data');
            setUser(prev => ({
              ...prev,
              district: result.city || result.state || 'Unknown',  // Use city as district
              location: {
                city: result.city,
                state: result.state,
                country: result.country,
                formattedAddress: result.formattedAddress,
                street: result.street  // Store street name
              }
            }));
          })
          .catch(err => {
            console.error('[App] Reverse geocoding failed:', err);
            // Fallback: use coordinates as district identifier
            setUser(prev => ({
              ...prev,
              district: `Location ${gpsPosition.latitude.toFixed(2)}, ${gpsPosition.longitude.toFixed(2)}`
            }));
          });
      });
    }
  }, [gpsPosition]);

  // Handle GPS errors
  useEffect(() => {
    if (gpsError) {
      console.error('[App] GPS error:', gpsError.message);

      if (gpsError.type === 'PERMISSION_DENIED') {
        toast.error('Location permission denied', {
          description: 'Please enable location access to use this app',
          duration: 5000
        });
      }
    }
  }, [gpsError]);

  // Load reports from dataService
  useEffect(() => {
    console.log('[App] Loading reports from dataService');
    const loadedReports = dataService.getReports();
    console.log('[App] Loaded reports:', loadedReports.map(r => ({
      id: r.id,
      title: r.title,
      coordinates: r.coordinates,
      district: r.district
    })));
    setReports(loadedReports);

    // Subscribe to data changes
    const unsubscribe = dataService.subscribe((updatedReports) => {
      console.log('[App] Received updated reports:', updatedReports.length);
      console.log('[App] Updated report coordinates:', updatedReports.map(r => ({
        id: r.id,
        coordinates: r.coordinates
      })));
      setReports(updatedReports);
    });

    return () => unsubscribe();
  }, []);

  // OLD: Initialize with realistic Siliguri Municipal Corporation reports
  // This is now handled by dataService
  /*
  useEffect(() => {
    const initialReports: Report[] = [
      {
        id: '1',
        title: 'Major pothole on Hill Cart Road',
        description: 'Deep pothole near Mahabirsthan causing severe traffic disruption and vehicle damage. Water logging during monsoon makes it worse.',
        imageUrl: 'https://www.transpoco.com/hubfs/the_pothole_problem_1%2C000%2C000%20reports%20every%20year%20(one%20every%20two%20minutes).png?w=400',
        media: [
          {
            id: '1-1',
            type: 'image',
            url: 'https://www.transpoco.com/hubfs/the_pothole_problem_1%2C000%2C000%20reports%20every%20year%20(one%20every%20two%20minutes).png?w=400'
          },
          {
            id: '1-2',
            type: 'image',
            url: 'https://i.pinimg.com/736x/bd/b7/e8/bdb7e8ec4259508ce023744b1aeb99fa.jpg?w=400'
          },
          {
            id: '1-3',
            type: 'video',
            url: 'https://example.com/pothole-video.mp4',
            thumbnail: 'https://i.pinimg.com/1200x/9a/f9/0d/9af90dfa7704caa1ea391a9b3f61b24c.jpg?w=400'
          }
        ],
        district: 'Siliguri',
        ward: 'Ward 12 - Mahabirsthan',
        street: 'Hill Cart Road',
        coordinates: { lat: 26.7271, lng: 88.3953 },
        distance: 0.3,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        aiTag: 'Road Infrastructure',
        aiConfidence: 94,
        status: 'pending',
        upvotes: 47,
        comments: [
          { id: '1', text: 'This is causing major traffic jams daily!', timestamp: new Date(), author: 'Rajesh Kumar' },
          { id: '2', text: 'My car tire got damaged here yesterday', timestamp: new Date(), author: 'Priya Singh' },
          { id: '3', text: 'Please fix this ASAP before monsoon', timestamp: new Date(), author: 'Amit Sharma' }
        ],
        severity: 9,
        type: 'road',
        hasUserUpvoted: false,
        priority: 'high'
      },
      {
        id: '2',
        title: 'Garbage overflow at Hong Kong Market',
        description: 'Multiple garbage bins overflowing at Hong Kong vegetable market. Creating health hazard and attracting stray dogs.',
        imageUrl: 'https://i.pinimg.com/736x/80/f3/96/80f3960217c48c2f1a8eda45ff5da35b.jpg?w=400',
        media: [
          {
            id: '2-1',
            type: 'image',
            url: 'https://i.pinimg.com/736x/80/f3/96/80f3960217c48c2f1a8eda45ff5da35b.jpg?w=400'
          },
          {
            id: '2-2',
            type: 'image',
            url: 'https://i.pinimg.com/1200x/96/16/38/96163836005bd8560ce0ebd6d3aa3e14.jpg?w=400'
          }
        ],
        district: 'Siliguri',
        ward: 'Ward 18 - Hong Kong Market',
        street: 'Sevoke Road',
        coordinates: { lat: 26.7135, lng: 88.4013 },
        distance: 1.2,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        aiTag: 'Waste Management',
        aiConfidence: 91,
        status: 'submitted',
        upvotes: 23,
        comments: [
          { id: '4', text: 'Health department should inspect this', timestamp: new Date(), author: 'Dr. Anita Devi' },
          { id: '5', text: 'Same issue reported last week too', timestamp: new Date(), author: 'Ravi Gupta' }
        ],
        severity: 7,
        type: 'garbage',
        hasUserUpvoted: false,
        priority: 'medium'
      },
      {
        id: '3',
        title: 'Street light not working - Pradhan Nagar',
        description: 'LED street light pole damaged near Pradhan Nagar Main Road. Area becomes unsafe after dark.',
        imageUrl: 'https://i.pinimg.com/1200x/f4/c0/5c/f4c05c75472d231f783af9b203cc2ec0.jpg?w=400&h=300',
        media: [
          {
            id: '3-1',
            type: 'image',
            url: 'https://i.pinimg.com/1200x/f4/c0/5c/f4c05c75472d231f783af9b203cc2ec0.jpg?w=400&h=300'
          },
          {
            id: '2-2',
            type: 'image',
            url: 'https://i.pinimg.com/1200x/90/13/ef/9013ef81025bd58455e717daaaa1934b.jpg?w=400&h=300'
          }
        ],
        district: 'Siliguri',
        ward: 'Ward 8 - Pradhan Nagar',
        street: 'Pradhan Nagar Main Road',
        coordinates: { lat: 26.7389, lng: 88.4115 },
        distance: 2.1,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        aiTag: 'Street Lighting',
        aiConfidence: 96,
        status: 'resolved',
        upvotes: 15,
        comments: [
          { id: '6', text: 'Fixed! Thank you SMC team', timestamp: new Date(), author: 'Suresh Mahato' }
        ],
        severity: 6,
        type: 'streetlight',
        hasUserUpvoted: false,
        priority: 'low'
      },
      {
        id: '4',
        title: 'Water supply disruption in Dagapur',
        description: 'No water supply for 3 days in Dagapur residential area. Residents facing severe hardship.',
        imageUrl: 'https://i.pinimg.com/1200x/1f/fe/4b/1ffe4b43e9dd07dda46f73aa463883e9.jpg?w=400',
        media: [
          {
            id: '3-1',
            type: 'image',
            url: 'https://i.pinimg.com/1200x/1f/fe/4b/1ffe4b43e9dd07dda46f73aa463883e9.jpg?w=400&h=400'
          },
          {
            id: '2-2',
            type: 'image',
            url: 'https://i.pinimg.com/736x/95/b9/99/95b9990ad03eef2a719e7d2dba1e431a.jpg?w=400&h=400'
          }
        ],
        district: 'Siliguri',
        ward: 'Ward 25 - Dagapur',
        street: 'Dagapur Main Road',
        coordinates: { lat: 26.7089, lng: 88.3789 },
        distance: 3.2,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        aiTag: 'Water Supply',
        aiConfidence: 89,
        status: 'submitted',
        upvotes: 67,
        comments: [
          { id: '7', text: 'Please urgently restore water supply!', timestamp: new Date(), author: 'Meera Gupta' },
          { id: '8', text: 'Children are suffering without water', timestamp: new Date(), author: 'Ashok Kumar' },
          { id: '9', text: 'SMC team is working on pipeline repair', timestamp: new Date(), author: 'SMC Official' }
        ],
        severity: 10,
        type: 'water',
        hasUserUpvoted: true,
        priority: 'high'
      },
      {
        id: '5',
        title: 'Drainage blockage at Siliguri Junction',
        description: 'Main drainage blocked causing water logging during rain. Urgent attention needed before monsoon peak.',
        imageUrl: 'https://i.pinimg.com/1200x/2b/79/8c/2b798c30e78d360375daafa709d68270.jpg?w=400',
        media: [
          {
            id: '3-1',
            type: 'image',
            url: 'https://i.pinimg.com/1200x/2b/79/8c/2b798c30e78d360375daafa709d68270.jpg?w=400'
          },
          {
            id: '2-2',
            type: 'image',
            url: 'https://i.pinimg.com/736x/3b/46/d9/3b46d9f4426d98d5d45e035c53b5836d.jpg?w=400'
          }
        ],
        district: 'Siliguri',
        ward: 'Ward 15 - Siliguri Junction',
        street: 'Junction Road',
        coordinates: { lat: 26.7205, lng: 88.3885 },
        distance: 1.8,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        aiTag: 'Drainage System',
        aiConfidence: 87,
        status: 'pending',
        upvotes: 34,
        comments: [
          { id: '10', text: 'Last year same issue caused flooding', timestamp: new Date(), author: 'Ravi Tiwari' },
          { id: '11', text: 'Need immediate action', timestamp: new Date(), author: 'Sita Devi' }
        ],
        severity: 8,
        type: 'drainage',
        hasUserUpvoted: false,
        priority: 'high'
      }
    ];
    setReports(initialReports);
    }, []);
    */

  const handleCompleteOnboarding = (selectedDistrict: string, coords: { lat: number; lng: number }, language: Language) => {
    setUser(prev => ({
      ...prev,
      district: selectedDistrict,
      coordinates: coords,
      language
    }));

    // Show post-location loading screen
    setIsPostLocationLoading(true);

    // Simulate setup time after location detection
    setTimeout(() => {
      setIsPostLocationLoading(false);
      setHasCompletedOnboarding(true);
      setCurrentScreen('home');
    }, 3000); // 3 second post-location loading
  };

  const handleAddReport = (newReport: Omit<Report, 'id' | 'timestamp' | 'upvotes' | 'comments' | 'distance' | 'hasUserUpvoted'>) => {
    console.log('[App] handleAddReport called with data:', {
      title: newReport.title,
      coordinates: newReport.coordinates,
      district: newReport.district
    });

    const report: Report = {
      ...newReport,
      id: Date.now().toString(),
      timestamp: new Date(),
      upvotes: 0,
      comments: [],
      distance: Math.random() * 3, // Simulate distance
      hasUserUpvoted: false,
      media: newReport.imageUrl ? [{
        id: `${Date.now()}-1`,
        type: 'image' as const,
        url: newReport.imageUrl
      }] : []
    };

    console.log('[App] Created report object:', {
      id: report.id,
      title: report.title,
      coordinates: report.coordinates,
      district: report.district
    });

    if (user.isOnline) {
      // Use dataService to add report (syncs to admin!)
      console.log('[App] Adding report to dataService...');
      dataService.addReport(report);

      toast.success(
        `🎉 ${translations[user.language].reportSubmitted} #${report.id.slice(-4)}`,
        {
          description: `Routed to ${getDepartmentName(report.type)} for processing`,
          duration: 4000,
        }
      );
    } else {
      toast.error('No internet connection. Report saved offline.');
    }

    setCurrentScreen('home');
  };

  const getDepartmentName = (issueType: string) => {
    const departments: Record<string, string> = {
      'road': 'Public Works Department',
      'garbage': 'Waste Management Department',
      'streetlight': 'Electrical Department',
      'water': 'Water Supply Department',
      'drainage': 'Drainage Department'
    };
    return departments[issueType.toLowerCase()] || 'Municipal Corporation';
  };

  const handleUpvote = (reportId: string) => {
    // Use dataService to persist upvote changes
    dataService.toggleUpvote(reportId, 'current-user');

    // Also update local state immediately for instant feedback
    setReports(prev => prev.map(report => {
      if (report.id === reportId) {
        const hasUpvoted = report.hasUserUpvoted;
        return {
          ...report,
          upvotes: hasUpvoted ? report.upvotes - 1 : report.upvotes + 1,
          hasUserUpvoted: !hasUpvoted
        };
      }
      return report;
    }));
  };

  const handleAddComment = (reportId: string, commentText: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      text: commentText,
      timestamp: new Date(),
      author: 'You'
    };

    // Use dataService to persist comment
    dataService.addComment(reportId, newComment);

    // Also update local state immediately for instant feedback
    setReports(prev => prev.map(report => {
      if (report.id === reportId) {
        const updatedReport = {
          ...report,
          comments: [...report.comments, newComment]
        };

        // Update selectedReport if it's the same report being commented on
        if (selectedReport && selectedReport.id === reportId) {
          setSelectedReport(updatedReport);
        }

        return updatedReport;
      }
      return report;
    }));
  };

  const handleLanguageChange = (language: Language) => {
    setUser(prev => ({ ...prev, language }));
  };

  const handleDeleteReport = (reportId: string) => {
    // Delete from dataService
    dataService.deleteReport(reportId);

    // Close modal if it was the selected report
    if (selectedReport?.id === reportId) {
      setSelectedReport(null);
    }
  };

  const handleFlag = (reportId: string) => {
    // Log the flag action (could be sent to backend)
    console.log(`[App] Report ${reportId} flagged for review`);

    // You could add logic here to:
    // - Update report status
    // - Send to moderation queue
    // - Store flag count
    // - Send to backend

    toast.info('Report flagged for review', {
      description: 'Our team will investigate this report',
      duration: 3000,
    });
  };

  const t = translations[user.language];

  // Show loading screen first
  if (isLoading) {
    return (
      <>
        <SIHBackground />
        <LoadingScreen />
      </>
    );
  }

  // Show post-location loading screen
  if (isPostLocationLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <PostLocationLoadingScreen detectedLocation={user.district || user.location?.city || 'Your Location'} />
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <>
        <SIHBackground />
        <div className="min-h-screen bg-background w-full mx-auto relative mobile-container">
          <OnboardingScreen
            onComplete={handleCompleteOnboarding}
            currentLanguage={user.language}
            onLanguageChange={handleLanguageChange}
          />
          <Toaster />
        </div>
      </>
    );
  }

  return (
    <>
      <SIHBackground />
      <div className="min-h-screen bg-background w-full mx-auto relative mobile-container">
        <DesktopMobileNotice />
        {currentScreen !== 'map' && (
          // Other screens with bottom padding for navigation
          <div className="pb-20">
            {currentScreen === 'home' && (
              <HomeScreen
                reports={reports}
                user={user}
                onReportSelect={setSelectedReport}
                onUpvote={handleUpvote}
                onAddComment={handleAddComment}
                selectedReport={selectedReport}
                onCloseModal={() => setSelectedReport(null)}
                onReportAgain={() => setCurrentScreen('report')}
                onDeleteReport={handleDeleteReport}
                onFlag={handleFlag}
              />
            )}

            {currentScreen === 'analytics' && (
              <AnalyticsScreen
                reports={reports}
                user={user}
              />
            )}

            {currentScreen === 'report' && (
              <ReportScreen
                user={user}
                onSubmit={handleAddReport}
                onCancel={() => setCurrentScreen('home')}
              />
            )}

            {currentScreen === 'profile' && (
              <ProfileScreen
                reports={reports.filter(r => r.userId === 'current-user')}
                user={user}
                onLanguageChange={handleLanguageChange}
                onToggleOnline={() => setUser(prev => ({ ...prev, isOnline: !prev.isOnline }))}
                onReportAgain={() => setCurrentScreen('report')}
              />
            )}
          </div>
        )}

        {currentScreen === 'map' && (
          // Map screen handles its own layout
          <SmartHeatmap
            reports={reports}
            user={user}
            onReportSelect={setSelectedReport}
            onUpvote={handleUpvote}
          />
        )}

        <BottomNavigation
          currentScreen={currentScreen}
          onScreenChange={setCurrentScreen}
          language={user.language}
        />

        <Toaster />
      </div>
    </>
  );
}