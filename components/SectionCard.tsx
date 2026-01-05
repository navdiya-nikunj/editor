'use client';

import { useState } from 'react';
import { Section } from '@/lib/supabase';
import { deleteSection, updateSection } from '@/lib/sections';
import toast from 'react-hot-toast';

interface SectionCardProps {
  section: Section;
  onDelete: (id: string) => void;
  onUpdate: (section: Section) => void;
}

export default function SectionCard({ section, onDelete, onUpdate }: SectionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState(section.content);
  const [loading, setLoading] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    
    setLoading(true);
    const { error } = await deleteSection(section.id);
    
    if (error) {
      toast.error('Failed to delete section');
    } else {
      toast.success('Section deleted');
      onDelete(section.id);
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    setLoading(true);
    const { data, error } = await updateSection(section.id, title, content);
    
    if (error) {
      toast.error('Failed to update section');
    } else {
      toast.success('Section updated');
      onUpdate(data as Section);
      setIsEditing(false);
    }
    setLoading(false);
  };

  const extractLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  const links = section.type === 'text' ? extractLinks(section.content) : [];

  const getIcon = () => {
    switch (section.type) {
      case 'text':
        return '📝';
      case 'link':
        return '🔗';
      case 'file':
        return '📎';
      default:
        return '📄';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getIcon()}</span>
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-semibold text-lg border-b-2 border-primary outline-none bg-transparent"
            />
          ) : (
            <h3 className="font-semibold text-lg">{section.title}</h3>
          )}
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-600 hover:text-gray-700 font-medium text-sm"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
          />
        ) : (
          <>
            <div className="relative">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {section.content}
              </p>
              <button
                onClick={() => handleCopy(section.content)}
                className="absolute top-0 right-0 text-xs bg-primary text-white px-3 py-1 rounded hover:bg-blue-600 transition"
              >
                Copy
              </button>
            </div>

            {section.type === 'link' && (
              <a
                href={section.content}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Open Link
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}

            {section.type === 'file' && section.file_url && (
              <a
                href={section.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Download File
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            )}

            {links.length > 0 && section.type === 'text' && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Found Links:
                </p>
                <div className="space-y-2">
                  {links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex-1 truncate"
                      >
                        {link}
                      </a>
                      <button
                        onClick={() => handleCopy(link)}
                        className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      >
                        Copy
                      </button>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                      >
                        Open
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        {new Date(section.created_at).toLocaleString()}
      </div>
    </div>
  );
}

