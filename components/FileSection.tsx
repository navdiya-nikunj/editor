'use client';

import { useState, useEffect, useRef } from 'react';
import { uploadFile, getFiles, deleteFile, subscribeToFiles } from '@/lib/sections';
import { FileRecord } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface FileSectionProps {
  userId: string;
}

export default function FileSection({ userId }: FileSectionProps) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load initial files
    const loadFiles = async () => {
      const { data, error } = await getFiles(userId);
      if (!error && data) {
        setFiles(data);
      }
    };
    loadFiles();

    // // Subscribe to file changes
    // const channel = subscribeToFiles(userId, (payload) => {
    //   if (payload.eventType === 'INSERT') {
    //     setFiles((prev) => [payload.new as FileRecord, ...prev]);
    //     toast.success('File uploaded from another device!', { duration: 2000 });
    //   } else if (payload.eventType === 'DELETE') {
    //     setFiles((prev) => prev.filter((f) => f.id !== payload.old.id));
    //   }
    // });

    // return () => {
    //   channel.unsubscribe();
    // };
  }, [userId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setUploading(true);
    const { data, error } = await uploadFile(userId, file);

    if (error) {
      toast.error('Failed to upload file');
    } else {
      toast.success('File uploaded successfully!');
      setFiles([data as FileRecord, ...files]);
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (file: FileRecord) => {
    if (!confirm(`Delete ${file.name}?`)) return;

    const { error } = await deleteFile(file.id, file.file_url, userId);

    if (error) {
      toast.error('Failed to delete file');
    } else {
      toast.success('File deleted');
      setFiles(files.filter((f) => f.id !== file.id));
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied!');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp': return '🖼️';
      case 'mp4':
      case 'mov':
      case 'avi': return '🎥';
      case 'mp3':
      case 'wav': return '🎵';
      case 'zip':
      case 'rar':
      case '7z': return '📦';
      default: return '📎';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold">Files ({files.length})</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Upload and access files across devices</p>
        </div>
        
        <label className="bg-primary hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg transition font-medium text-xs sm:text-sm cursor-pointer">
          {uploading ? 'Uploading...' : '+ Upload'}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400">
          <div className="text-3xl sm:text-4xl mb-2">📁</div>
          <p className="text-sm">No files uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            >
              <span className="text-xl sm:text-2xl flex-shrink-0">{getFileIcon(file.name)}</span>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm sm:text-base" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)} · {new Date(file.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => handleCopyUrl(file.file_url)}
                  className="text-xs bg-gray-200 dark:bg-gray-600 px-2 sm:px-3 py-1.5 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition whitespace-nowrap"
                  title="Copy link"
                >
                  Copy
                </button>
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-primary text-white px-2 sm:px-3 py-1.5 rounded hover:bg-blue-600 transition whitespace-nowrap"
                >
                  Open
                </a>
                <button
                  onClick={() => handleDelete(file)}
                  className="text-xs bg-red-500 text-white px-2 sm:px-3 py-1.5 rounded hover:bg-red-600 transition"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

