import React from 'react';
import { VideoJob, getStatusColor, getStatusText } from '../../../stores/videoStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  DownloadIcon, 
  RefreshCwIcon, 
  TrashIcon, 
  ExternalLinkIcon,
  PlayIcon,
  ClockIcon,
  AlertCircleIcon,
  CheckCircleIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VideoJobCardProps {
  job: VideoJob;
  onDownload: (url: string, filename?: string) => void;
  onRetry: (job: VideoJob) => void;
  onDelete: (jobId: string) => void;
}

export const VideoJobCard: React.FC<VideoJobCardProps> = ({
  job,
  onDownload,
  onRetry,
  onDelete,
}) => {
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'FAILED':
        return <AlertCircleIcon className="h-4 w-4" />;
      case 'PENDING':
      case 'QUEUED':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <RefreshCwIcon className="h-4 w-4 animate-spin" />;
    }
  };

  const isProcessing = !['COMPLETED', 'FAILED'].includes(job.status);
  const isCompleted = job.status === 'COMPLETED';
  const isFailed = job.status === 'FAILED';
  
  const thumbnail = getYouTubeThumbnail(job.youtubeUrl);
  const s3Urls = Array.isArray(job.s3Urls) ? job.s3Urls : 
                 job.clipsData?.s3_urls || 
                 (job.clipsData?.s3_url ? [job.clipsData.s3_url] : []);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {job.title || `Video ${job.id.slice(0, 8)}`}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="secondary" 
                className={`${getStatusColor(job.status)} text-white`}
              >
                <span className="flex items-center gap-1">
                  {getStatusIcon(job.status)}
                  {getStatusText(job.status)}
                </span>
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(job.createdAt, { addSuffix: true })}
              </span>
            </div>
          </div>
          {thumbnail && (
            <div className="flex-shrink-0 ml-4">
              <img
                src={thumbnail}
                alt="Video thumbnail"
                className="w-20 h-12 object-cover rounded-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{job.statusMessage || 'Processing...'}</span>
              <span>{job.progress}%</span>
            </div>
            <Progress value={job.progress} className="w-full" />
          </div>
        )}

        {/* Error Message */}
        {isFailed && job.errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{job.errorMessage}</p>
          </div>
        )}

        {/* Video URL */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <PlayIcon className="h-4 w-4" />
          <a 
            href={job.youtubeUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="truncate hover:text-foreground transition-colors flex items-center gap-1"
          >
            {job.youtubeUrl}
            <ExternalLinkIcon className="h-3 w-3" />
          </a>
        </div>

        {/* Clips */}
        {isCompleted && s3Urls.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Generated Clips ({s3Urls.length})</h4>
            <div className="grid gap-2">
              {s3Urls.map((url: string, index: number) => (
                <div key={index} className="flex items-center justify-between bg-muted rounded-md p-2">
                  <span className="text-sm truncate mr-2">
                    Clip {index + 1}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDownload(url, `clip-${index + 1}-${job.id.slice(0, 8)}.mp4`)}
                  >
                    <DownloadIcon className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {isFailed && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRetry(job)}
              className="flex items-center gap-1"
            >
              <RefreshCwIcon className="h-4 w-4" />
              Retry
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(job.id)}
            className="flex items-center gap-1 text-red-600 hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
