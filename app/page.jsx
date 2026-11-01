'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user?.role === 'admin') {
            router.replace('/admin');
          } else {
            router.replace('/judge');
          }
        } else {
          router.replace('/login');
        }
      } catch {
        router.replace('/login');
      }
    }
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center p-4">
      <div className="w-10 h-10 border-2 border-[#ff7a1a] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-xs font-mono text-neutral-400">Loading HACK-O-LANTERN Judge Portal...</p>
    </div>
  );
}
