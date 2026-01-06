'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Logo from '@/components/Logo';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const currentSession = await getSession();
      setSession(currentSession);
      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Logo size={36} showText={true} />
          
          <div className="flex gap-3">
            {session ? (
              <Link
                href="/dashboard"
                className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg transition font-semibold"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary px-4 py-2.5 rounded-lg transition font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg transition font-semibold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <Logo size={80} showText={false} />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Sync Your Content
            <br />
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Across All Devices
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Copy on your phone, paste on your laptop. Share text, links, and files instantly across all your devices in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-primary hover:bg-blue-600 text-white px-8 py-4 rounded-lg transition font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              href="#features"
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-8 py-4 rounded-lg transition font-semibold text-lg shadow-lg"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Simple, fast, and secure content sharing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Real-Time Sync
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Changes appear instantly across all your devices. No refresh needed.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Live Editor
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Type or paste anything. Your content is auto-saved and synced.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Smart Link Detection
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Automatically detects URLs in your text with quick copy and open actions.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">📎</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              File Sharing
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Upload files up to 50MB and access them from any device instantly.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Secure & Private
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your data is encrypted and only accessible to you. 24-day sessions.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Mobile Friendly
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Fully responsive design. Works perfectly on phones, tablets, and desktops.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-12 text-center shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join ClipSync today and experience seamless content sharing across all your devices.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white hover:bg-gray-100 text-primary px-8 py-4 rounded-lg transition font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <Logo size={32} showText={true} className="justify-center mb-4" />
          <p className="text-sm">
            © {new Date().getFullYear()} ClipSync. Share content across your devices instantly.
          </p>
        </div>
      </footer>
    </div>
  );
}

