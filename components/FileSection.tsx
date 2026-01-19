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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

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

  const processFileUpload = async (file: File) => {
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
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await processFileUpload(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const file = droppedFiles[0];
      await processFileUpload(file);
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

  const handleShare = async (file: FileRecord) => {
    // Check if Web Share API is available (mobile browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: file.name,
          text: `Check out this file: ${file.name}`,
          url: file.file_url,
        });
        toast.success('Shared successfully!');
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback for desktop - copy link
      handleCopyUrl(file.file_url);
    }
  };

  const handleShareWhatsApp = (file: FileRecord) => {
    const text = encodeURIComponent(`Check out this file: ${file.name}\n${file.file_url}`);
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleShareTelegram = (file: FileRecord) => {
    const text = encodeURIComponent(`Check out this file: ${file.name}`);
    const url = `https://t.me/share/url?url=${encodeURIComponent(file.file_url)}&text=${text}`;
    window.open(url, '_blank');
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

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mb-4 border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all ${
          isDragging
            ? 'border-primary bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <div className={`text-4xl sm:text-5xl transition-transform ${isDragging ? 'scale-110' : ''}`}>
            📤
          </div>
          <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
            {isDragging ? 'Drop file here!' : 'Drag & drop file here'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            or click the upload button above
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Max file size: 50MB
          </p>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-4 sm:py-8 text-gray-500 dark:text-gray-400">
          <div className="text-3xl sm:text-4xl mb-2">📁</div>
          <p className="text-sm">No files uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition p-3 sm:p-4"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="text-xl sm:text-2xl flex-shrink-0">{getFileIcon(file.name)}</span>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm sm:text-base" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)} · {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(file)}
                  className="text-xs bg-red-500 text-white px-2 sm:px-3 py-1.5 rounded hover:bg-red-600 transition flex-shrink-0"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCopyUrl(file.file_url)}
                  className="flex-1 min-w-[80px] text-xs bg-gray-200 dark:bg-gray-600 px-3 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition font-medium"
                >
                  📋 Copy Link
                </button>
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[80px] text-xs bg-primary text-white px-3 py-2 rounded hover:bg-blue-600 transition text-center font-medium"
                >
                  👁️ Open
                </a>
                {navigator.share !== undefined && (
                  <button
                    onClick={() => handleShare(file)}
                    className="flex-1 min-w-[80px] text-xs bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition font-medium"
                  >
                    📱 Share
                  </button>
                )}
                <button
                  onClick={() => handleShareWhatsApp(file)}
                  className="text-xs bg-[#25D366] text-white px-3 py-2 rounded hover:bg-[#20BA5A] transition font-medium"
                  title="Share on WhatsApp"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShareTelegram(file)}
                  className="text-xs bg-[#0088cc] text-white px-3 py-2 rounded hover:bg-[#006699] transition font-medium"
                  title="Share on Telegram"
                >
                  Telegram
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

