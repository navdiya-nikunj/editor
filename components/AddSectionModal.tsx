'use client';

import { useState, FormEvent } from 'react';
import { createSection, uploadFile } from '@/lib/sections';
import toast from 'react-hot-toast';
import { Section } from '@/lib/supabase';

interface AddSectionModalProps {
  userId: string;
  onClose: () => void;
  onAdd: (section: Section) => void;
}

export default function AddSectionModal({ userId, onClose, onAdd }: AddSectionModalProps) {
  const [type, setType] = useState<'text' | 'link' | 'file'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let fileUrl = undefined;
      
      if (type === 'file' && file) {
        const { data, error } = await uploadFile(userId, file);
        if (error) throw new Error('Failed to upload file');
        fileUrl = data;
      }

      const { data, error } = await createSection(
        userId,
        type,
        title,
        content,
        fileUrl
      );

      if (error) throw error;
      
      toast.success('Section added successfully!');
      onAdd(data as Section);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Add New Section</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'text' | 'link' | 'file')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="text">Text</option>
              <option value="link">Link</option>
              <option value="file">File</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-primary outline-none"
              placeholder="Enter title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {type === 'link' ? 'URL' : 'Content'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-primary outline-none"
              placeholder={
                type === 'link'
                  ? 'https://example.com'
                  : type === 'file'
                  ? 'File description'
                  : 'Enter your text content'
              }
            />
          </div>

          {type === 'file' && (
            <div>
              <label className="block text-sm font-medium mb-2">Upload File</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Section'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

