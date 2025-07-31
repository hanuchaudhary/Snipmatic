import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Loader2, Download, FileText, Scissors } from 'lucide-react';

interface TaskProgressLoaderProps {
  status: 'PENDING' | 'QUEUED' | 'DOWNLOADING' | 'TRANSCRIBING' | 'CREATING_CLIPS' | 'COMPLETED' | 'FAILED';
  progress: number;
  statusMessage?: string;
  errorMessage?: string;
  className?: string;
}

const statusConfig = {
  PENDING: {
    icon: Loader2,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    message: 'Initializing task...'
  },
  QUEUED: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    message: 'Task queued for processing...'
  },
  DOWNLOADING: {
    icon: Download,
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    message: 'Downloading video...'
  },
  TRANSCRIBING: {
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-600/10',
    message: 'Transcribing audio...'
  },
  CREATING_CLIPS: {
    icon: Scissors,
    color: 'text-green-600',
    bgColor: 'bg-green-600/10',
    message: 'Creating clips...'
  },
  COMPLETED: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    message: 'Task completed successfully!'
  },
  FAILED: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    message: 'Task failed'
  }
};

export function TaskProgressLoader({ 
  status, 
  progress, 
  statusMessage, 
  errorMessage,
  className = "" 
}: TaskProgressLoaderProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isAnimated = ['PENDING', 'QUEUED', 'DOWNLOADING', 'TRANSCRIBING', 'CREATING_CLIPS'].includes(status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full max-w-md mx-auto p-6 bg-card rounded-lg border shadow-sm ${className}`}
    >
      {/* Status Icon and Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 rounded-full ${config.bgColor}`}>
          <Icon 
            className={`h-5 w-5 ${config.color} ${isAnimated ? 'animate-spin' : ''}`}
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">
            {status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
          </h3>
          <p className="text-sm text-muted-foreground">
            {statusMessage || config.message}
          </p>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          {progress}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        
        {/* Progress Steps */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className={progress >= 0 ? config.color : ''}>Start</span>
          <span className={progress >= 25 ? config.color : ''}>Download</span>
          <span className={progress >= 50 ? config.color : ''}>Transcribe</span>
          <span className={progress >= 75 ? config.color : ''}>Process</span>
          <span className={progress >= 100 ? config.color : ''}>Complete</span>
        </div>
      </div>

      {/* Error Message */}
      {status === 'FAILED' && errorMessage && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
        >
          <p className="text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        </motion.div>
      )}

      {/* Success Animation */}
      {status === 'COMPLETED' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mt-4 flex items-center justify-center"
        >
          <div className="text-green-500">
            <CheckCircle className="h-8 w-8" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
