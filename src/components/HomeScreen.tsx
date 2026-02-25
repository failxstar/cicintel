import React, { useState } from 'react';
import { Search, ArrowUp, MessageCircle, Flag, X, Mic, Building2, Clock, MapPin, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { motion, AnimatePresence } from 'motion/react';
import { Report, Comment, User } from '../App';
import { translations } from './translations';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MediaCarousel } from './MediaCarousel';
import { FloatingActionButton } from './FloatingActionButton';

interface HomeScreenProps {
  reports: Report[];
  user: User;
  onReportSelect: (report: Report) => void;
  onUpvote: (reportId: string) => void;
  onAddComment: (reportId: string, comment: string) => void;
  selectedReport: Report | null;
  onCloseModal: () => void;
  onReportAgain: () => void;
  onDeleteReport?: (reportId: string) => void;
  onFlag?: (reportId: string) => void;
}

export function HomeScreen({
  reports,
  user,
  onReportSelect,
  onUpvote,
  onAddComment,
  selectedReport,
  onCloseModal,
  onReportAgain,
  onDeleteReport,
  onFlag
}: HomeScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showUpvotePopup, setShowUpvotePopup] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [showFlagPopup, setShowFlagPopup] = useState(false);
  const [upvotedReportId, setUpvotedReportId] = useState<string | null>(null);
  const [commentedReportId, setCommentedReportId] = useState<string | null>(null);
  const [flaggedReportId, setFlaggedReportId] = useState<string | null>(null);
  const [tempComment, setTempComment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const t = translations[user.language];

  // Helper function for formatting audio duration
  const formatAudioDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

  // Helper function to play audio
  const playAudio = (dataUrl: string) => {
    const audio = new Audio(dataUrl);
    audio.play();
  };

  const getDepartmentInfo = (issueType: string) => {
    const departments: Record<string, { name: string; fullName: string; color: string }> = {
      'road': { name: 'PWD', fullName: t.publicWorksDept, color: 'bg-blue-100 text-blue-800' },
      'garbage': { name: 'WMD', fullName: t.wasteManagementDept, color: 'bg-green-100 text-green-800' },
      'streetlight': { name: 'ED', fullName: t.electricalDept, color: 'bg-yellow-100 text-yellow-800' },
      'water': { name: 'WSD', fullName: t.waterSupplyDept, color: 'bg-cyan-100 text-cyan-800' },
      'drainage': { name: 'DD', fullName: t.drainageDept, color: 'bg-purple-100 text-purple-800' },
      'other': { name: 'MC', fullName: t.municipalCorporation, color: 'bg-gray-100 text-gray-800' }
    };
    return departments[issueType.toLowerCase()] || departments.other;
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} ${t.minutesAgo}`;
    } else if (diffHours < 24) {
      return `${diffHours} ${t.hoursAgo}`;
    } else {
      return `${diffDays} ${t.daysAgo}`;
    }
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800';
      case 'acknowledged': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Report['status']) => {
    switch (status) {
      case 'pending': return t.statusPending;
      case 'acknowledged': return 'Acknowledged';
      case 'submitted': return t.statusInProgress;
      case 'resolved': return t.statusResolved;
      default: return status;
    }
  };

  const filteredReports = reports
    .filter(report =>
      report.district === user.district &&
      (searchTerm === '' ||
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.street.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      // Sort by distance then by recency
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

  const handleUpvoteClick = (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation();
    onUpvote(reportId);

    // Show upvote confirmation popup
    setUpvotedReportId(reportId);
    setShowUpvotePopup(true);

    // Auto-hide popup after 2 seconds
    setTimeout(() => {
      setShowUpvotePopup(false);
      setUpvotedReportId(null);
    }, 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && selectedReport) {
      onAddComment(selectedReport.id, newComment.trim());
      setTempComment(newComment.trim());
      setNewComment('');

      // Show comment confirmation popup
      setCommentedReportId(selectedReport.id);
      setShowCommentPopup(true);

      // Auto-hide popup after 2 seconds
      setTimeout(() => {
        setShowCommentPopup(false);
        setCommentedReportId(null);
        setTempComment('');
      }, 2000);
    }
  };

  const handleFlagReport = (reportId: string) => {
    if (onFlag) {
      onFlag(reportId);
    }

    // Show flag confirmation popup
    setFlaggedReportId(reportId);
    setShowFlagPopup(true);

    // Auto-hide popup after 2 seconds
    setTimeout(() => {
      setShowFlagPopup(false);
      setFlaggedReportId(null);
    }, 2000);
  };

  const handleDeleteReport = () => {
    if (selectedReport) {
      // Call onDeleteReport if provided, otherwise just close modal
      if (onDeleteReport) {
        onDeleteReport(selectedReport.id);
      }
      setShowDeleteConfirm(false);
      onCloseModal();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-primary">CivicIntel</h1>
              <p className="text-sm text-muted-foreground">
                {(() => {
                  // Prefer city over highway numbers (NH83, SH12, etc.)
                  const street = user.location?.street || '';
                  const isHighway = /^(NH|SH|MDR|ODR)\d+/i.test(street);
                  return isHighway ? (user.location?.city || street) : (street || user.location?.city || t.siliguriMunicipalCorporation);
                })()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-green-600">{filteredReports.length} {t.activeReports}</div>
              <div className="text-xs text-muted-foreground">{t.realTimeUpdates}</div>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
          <p className='mt-2 text-sm text-red-500'>{t.prototypeDataMessage}</p>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="p-3 space-y-4 bg-gray-50">
        {filteredReports.map((report) => (
          <motion.div
            key={report.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col"
            onClick={() => onReportSelect(report)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Remove the priority ribbon */}

            {/* Location full width at top */}
            <div className="pl-4 pr-4 pt-4 pb-0 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">{report.district}</span>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-gray-600">{report.distance}{t.kmAway}</span>
                <div className="flex items-center justify-center gap-1 ml-auto mr-2">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">{formatTimeAgo(report.timestamp)}</span>
                </div>
              </div>
            </div>

            {/* Report title and description */}
            <div className="mt-2 px-4 pb-2 flex-shrink-0">
              <h4 className="font-semibold text-gray-900 text-base mb-1 leading-tight line-clamp-2">{report.title}</h4>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{report.description}</p>
            </div>

            {/* Media Carousel - 5:4 aspect ratio */}
            <div className="relative w-full px-6">
              <div className="w-full aspect-[5/4] overflow-hidden rounded-xl">
                <MediaCarousel
                  media={report.media || [{
                    id: `${report.id}-main`,
                    type: 'image',
                    url: report.imageUrl
                  }]}
                  className="w-full h-full"
                />
              </div>
              {report.isTamperDetected && (
                <div className="absolute top-3 right-9 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  ⚠️ Verified
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <motion.button
                    className={`flex items-center gap-1 text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg shadow-md hover:shadow-lg ${report.hasUserUpvoted
                      ? 'text-green-600 bg-green-50 border border-green-200 shadow-green-200'
                      : 'text-gray-700 hover:text-blue-600 bg-white border border-gray-200 hover:bg-blue-50'
                      }`}
                    onClick={(e: React.MouseEvent) => handleUpvoteClick(e, report.id)}
                    whileTap={{ scale: 1.1 }}
                  >
                    <motion.div
                      animate={report.hasUserUpvoted ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowUp className={`w-5 h-5 ${report.hasUserUpvoted ? 'fill-current' : ''}`} />
                    </motion.div>
                    <span className="font-semibold">{report.upvotes}</span>
                  </motion.button>

                  <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-200 px-3 py-2 rounded-lg shadow-md hover:shadow-lg bg-white border border-gray-200 hover:bg-blue-50">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-semibold">{report.comments.length}</span>
                  </button>

                  {/* Priority indicator */}
                  {report.priority && (
                    <div className={`flex items-center gap-1.5 text-base font-semibold px-4 py-2 rounded-full ${report.priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : report.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                      }`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${report.priority === 'high'
                        ? 'bg-red-500'
                        : report.priority === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                        }`}></span>
                      {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                    </div>
                  )}
                </div>

                {/* Status badge moved to bottom right */}
                <Badge className={`text-base font-semibold px-4 py-2 ${getStatusColor(report.status)}`}>
                  {getStatusText(report.status)}
                </Badge>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredReports.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No reports found for your search.</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onReportClick={onReportAgain}
        onQuickPhotoClick={onReportAgain}
        isVisible={true}
      />

      {/* Upvote Confirmation Popup */}
      <AnimatePresence>
        {showUpvotePopup && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-20 right-4 z-[9999] bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 max-w-xs"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Upvoted successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Confirmation Popup */}
      <AnimatePresence>
        {showCommentPopup && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-36 right-4 z-[9999] bg-blue-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 max-w-xs"
          >
            <MessageCircle className="w-5 h-5" />
            <div className="flex flex-col">
              <span className="font-medium">Comment added!</span>
              <span className="text-sm opacity-90 truncate">{tempComment}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flag Confirmation Popup */}
      <AnimatePresence>
        {showFlagPopup && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-52 right-4 z-[9999] bg-orange-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 max-w-xs"
          >
            <Flag className="w-5 h-5" />
            <span className="font-medium">Report flagged for review</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Report Detail Modal (without backdrop) */}
      {selectedReport && (
        <motion.div
          className="fixed inset-0 max-w-sm mx-auto bg-white z-[10000] overflow-y-auto"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 500 }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">{selectedReport.title}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {selectedReport.ward} • {user.location?.street || selectedReport.street} • {formatTimeAgo(selectedReport.timestamp)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 p-1 h-8 w-8"
              onClick={onCloseModal}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-4 space-y-4">
            {/* Image section - REDUCED SIZE for better UX */}
            <div className="relative h-48 overflow-hidden group">
              <ImageWithFallback
                src={selectedReport.imageUrl}
                alt={selectedReport.title}
                className="w-full h-full"
              />
              {selectedReport.isTamperDetected && (
                <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                  {t.tamperDetected}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge className={`text-xs ${getStatusColor(selectedReport.status)}`}>
                  {getStatusText(selectedReport.status)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(selectedReport.timestamp)}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                {selectedReport.ward} • {user.location?.street || selectedReport.street} • {selectedReport.distance}km
              </p>

              <Badge variant="secondary" className="text-xs mb-3">
                {selectedReport.aiTag} — {selectedReport.aiConfidence}% {t.confidence}
              </Badge>

              {/* Department Routing Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">{t.departmentAssignment}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-blue-800">
                    <strong>{getDepartmentInfo(selectedReport.type).name}</strong> - {getDepartmentInfo(selectedReport.type).fullName}
                  </p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-blue-700">
                      {t.estimatedResponse} 24-48 {t.hours || 'hours'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm mb-4">{selectedReport.description}</p>

              {/* Voice note - only show if exists */}
              {selectedReport.voiceNoteUrl && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mic className="w-4 h-4" />
                    <span>{t.voiceNote} ({formatAudioDuration(selectedReport.voiceNoteDuration || 0)})</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto py-1 px-2 ml-auto"
                      onClick={() => playAudio(selectedReport.voiceNoteUrl!)}
                    >
                      {t.play}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                className={`flex items-center gap-1 px-3 py-2 rounded text-sm ${selectedReport.hasUserUpvoted
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
                  }`}
                onClick={(e) => {
                  e.stopPropagation();  // Prevent event bubbling to card behind modal
                  onUpvote(selectedReport.id);
                }}
                whileTap={{ scale: 1.05 }}
              >
                <ArrowUp className="w-4 h-4" />
                {selectedReport.upvotes} {t.upvote}
              </motion.button>

              <Button
                variant="outline"
                size="sm"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleFlagReport(selectedReport.id);
                }}
              >
                <Flag className="w-4 h-4 mr-1" />
                {t.flag}
              </Button>

              <Button
                variant="outline"
                size="sm"
                style={{ color: '#dc2626', borderColor: '#fecaca' }}
                className="hover:bg-red-50"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-1" style={{ color: '#dc2626' }} />
                {t.delete}
              </Button>
            </div>

            {/* Comments */}
            <div>
              <h4 className="font-medium mb-3">{t.comments}</h4>

              <div className="space-y-3 mb-4">
                {selectedReport.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))}
              </div>

              {/* Add comment */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <Textarea
                  placeholder={t.addComment}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 min-h-0 h-10"
                />
                <Button type="submit" size="sm" disabled={!newComment.trim()}>
                  {t.postComment}
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && selectedReport && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20000 }}
            onClick={() => setShowDeleteConfirm(false)}
          />

          {/* Dialog */}
          <div
            className="fixed bg-white rounded-lg shadow-2xl p-6"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 20001,
              maxWidth: '400px',
              width: '90%',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Delete Report?</h3>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete "<strong>{selectedReport.title}</strong>"? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteReport}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

