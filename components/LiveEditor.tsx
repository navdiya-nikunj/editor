'use client';

import { useState, useEffect, useRef } from 'react';
import { updateDocument, subscribeToDocument } from '@/lib/sections';
import toast from 'react-hot-toast';

interface LiveEditorProps {
  userId: string;
  initialContent: string;
}

export default function LiveEditor({ userId, initialContent }: LiveEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const isRemoteUpdateRef = useRef(false);

  useEffect(() => {
    // Subscribe to realtime changes
    const channel = subscribeToDocument(userId, (payload) => {
      if (payload.new && payload.new.content !== content) {
        isRemoteUpdateRef.current = true;
        setContent(payload.new.content);
        toast.success('Content synced from another device!', { duration: 2000 });
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  useEffect(() => {
    // Skip if this is a remote update
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    // Auto-save with debounce
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      const { error } = await updateDocument(userId, content);
      
      if (error) {
        toast.error('Failed to save');
      } else {
        setLastSaved(new Date());
      }
      setIsSaving(false);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, userId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all content?')) {
      setContent('');
      toast.success('Content cleared');
    }
  };

  const extractLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  const links = extractLinks(content);
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-wrap">
            <span>{wordCount} words</span>
            <span className="hidden sm:inline">·</span>
            <span>{charCount} chars</span>
            {lastSaved && (
              <>
                <span className="hidden sm:inline">·</span>
                <span className="flex items-center gap-1">
                  {isSaving ? (
                    <>
                      <span className="animate-pulse">●</span> <span className="hidden sm:inline">Saving...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-green-500">✓</span> <span className="hidden sm:inline">Saved {lastSaved.toLocaleTimeString()}</span>
                    </>
                  )}
                </span>
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="bg-primary hover:bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition font-medium text-xs sm:text-sm"
            >
              Copy
            </button>
            <button
              onClick={handleClear}
              className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition font-medium text-xs sm:text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col min-h-[300px] sm:min-h-[400px]">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing or paste content here... It will automatically sync across your devices! 🚀"
          className="flex-1 w-full p-4 sm:p-6 outline-none resize-none text-gray-800 dark:text-gray-200 bg-transparent text-base sm:text-lg leading-relaxed"
          autoFocus
        />
      </div>

      {links.length > 0 && (
        <div className="mt-3 sm:mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-base sm:text-lg">Detected Links ({links.length})</h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {links.map((link, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-primary hover:underline truncate text-xs sm:text-sm"
                  title={link}
                >
                  {link}
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(link);
                    toast.success('Link copied!');
                  }}
                  className="text-xs bg-gray-200 dark:bg-gray-600 px-2 sm:px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition whitespace-nowrap"
                >
                  Copy
                </button>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-primary text-white px-2 sm:px-3 py-1 rounded hover:bg-blue-600 transition whitespace-nowrap"
                >
                  Open
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


