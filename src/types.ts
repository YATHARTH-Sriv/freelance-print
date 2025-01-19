export type FileState = {
    file: File;
    key: string;
    progress: 'PENDING' | 'UPLOADING' | 'COMPLETE' | 'ERROR';
    url?: string; // Add this line
  };