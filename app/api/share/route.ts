import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const title = formData.get('title') as string;
    const text = formData.get('text') as string;
    const url = formData.get('url') as string;

    // Get session from cookies
    const cookieStore = request.headers.get('cookie') || '';
    const sessionMatch = cookieStore.match(/sb-[^=]+-auth-token=([^;]+)/);
    
    if (!sessionMatch) {
      // No session, store shared content in URL params and redirect to login
      const params = new URLSearchParams();
      if (title) params.set('title', title);
      if (text) params.set('text', text);
      if (url) params.set('url', url);
      if (files.length > 0) params.set('hasFiles', 'true');
      
      return NextResponse.redirect(new URL(`/login?redirect=share&${params.toString()}`, request.url));
    }

    // If we have files, we need to handle them differently
    if (files.length > 0) {
      // Store file info temporarily and redirect to share page
      // The share page will handle the actual upload after user authentication
      const fileInfo = files.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type
      }));
      
      return NextResponse.redirect(new URL(`/share?files=${encodeURIComponent(JSON.stringify(fileInfo))}&title=${encodeURIComponent(title || '')}&text=${encodeURIComponent(text || '')}&url=${encodeURIComponent(url || '')}`, request.url));
    }

    // Handle text/URL sharing
    const params = new URLSearchParams();
    params.set('success', 'true');
    if (title) params.set('title', title);
    if (text) params.set('text', text);
    if (url) params.set('url', url);
    
    return NextResponse.redirect(new URL(`/share?${params.toString()}`, request.url));
  } catch (error) {
    console.error('Share API error:', error);
    return NextResponse.redirect(new URL('/share?error=true', request.url));
  }
}