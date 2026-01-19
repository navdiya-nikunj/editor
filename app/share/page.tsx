'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { updateDocument, getOrCreateDocument } from '@/lib/sections';
import Logo from '@/components/Logo';
import toast from 'react-hot-toast';

export default function SharePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [message, setMessage] = useState('Processing shared content...');

  useEffect(() => {
    const handleSharedContent = async () => {
      const user = await getCurrentUser();
      
      if (!user) {
        // Store shared content temporarily and redirect to login
        const currentParams = new URLSearchParams(window.location.search);
        router.push(`/login?redirect=share&${currentParams.toString()}`);
        return;
      }

      try {
        // Get shared data from URL params
        const title = searchParams.get('title');
        const text = searchParams.get('text');
        const url = searchParams.get('url');
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const filesParam = searchParams.get('files');

        if (error) {
          toast.error('Failed to process shared content');
          setMessage('Error processing shared content');
          setProcessing(false);
          return;
        }

        if (success === 'true' || title || text || url) {
          // Handle shared text/URL - add to editor
          const sharedContent = [title, text, url].filter(Boolean).join('\n\n');
          
          if (sharedContent.trim()) {
            // Get current document and append shared content
            const { data: doc } = await getOrCreateDocument(user.id);
            const currentContent = doc?.content || '';
            const newContent = currentContent ? `${currentContent}\n\n--- Shared Content ---\n${sharedContent}` : sharedContent;
            
            await updateDocument(user.id, newContent);
            toast.success('Content added to your editor!');
            setMessage('Content successfully added to your editor!');
          }
        }

        if (filesParam) {
          try {
            const fileInfo = JSON.parse(decodeURIComponent(filesParam));
            setMessage(`Ready to upload ${fileInfo.length} file(s). Please use the file upload feature in the dashboard.`);
            toast.success(`Found ${fileInfo.length} shared file(s). Use the upload feature to add them.`);
          } catch (e) {
            console.error('Error parsing file info:', e);
          }
        }

        if (!title && !text && !url && !filesParam && !success) {
          setMessage('No content to share found.');
        }

      } catch (error) {
        console.error('Error handling shared content:', error);
        toast.error('Failed to process shared content');
        setMessage('Error processing shared content');
      }

      setProcessing(false);
    };

    handleSharedContent();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 text-center">
        <div className="flex justify-center mb-6">
          <Logo size={48} showText={true} />
        </div>
        
        {processing ? (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {message.includes('Error') ? 'Oops!' : 'Success!'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                Go to Editor
              </button>
              <button
                onClick={() => router.push('/dashboard/files')}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg transition font-semibold"
              >
                Go to Files
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}