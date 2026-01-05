'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getSections } from '@/lib/sections';
import { Section } from '@/lib/supabase';
import Header from '@/components/Header';
import SectionCard from '@/components/SectionCard';
import AddSectionModal from '@/components/AddSectionModal';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'text' | 'link' | 'file'>('all');

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);
      
      const { data, error } = await getSections(currentUser.id);
      
      if (error) {
        toast.error('Failed to load sections');
      } else {
        setSections(data || []);
      }
      
      setLoading(false);
    };

    loadData();
  }, [router]);

  const handleDeleteSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleUpdateSection = (updatedSection: Section) => {
    setSections(sections.map((s) => (s.id === updatedSection.id ? updatedSection : s)));
  };

  const handleAddSection = (newSection: Section) => {
    setSections([newSection, ...sections]);
  };

  const filteredSections = filter === 'all' 
    ? sections 
    : sections.filter((s) => s.type === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header userEmail={user?.email || ''} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Your Sections</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and share your content across devices
            </p>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Section
          </button>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('text')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'text'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            📝 Text
          </button>
          <button
            onClick={() => setFilter('link')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'link'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            🔗 Links
          </button>
          <button
            onClick={() => setFilter('file')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'file'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            📎 Files
          </button>
        </div>

        {filteredSections.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No sections yet
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              Start by adding your first section
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition font-semibold"
            >
              Add Your First Section
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                onDelete={handleDeleteSection}
                onUpdate={handleUpdateSection}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <AddSectionModal
          userId={user?.id}
          onClose={() => setShowModal(false)}
          onAdd={handleAddSection}
        />
      )}
    </div>
  );
}

