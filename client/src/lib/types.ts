export interface ITaskStatus {
  task_id: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  progress?: number;
  message?: string;
  result?: any;
  created_at: string;
  updated_at: string;
}
