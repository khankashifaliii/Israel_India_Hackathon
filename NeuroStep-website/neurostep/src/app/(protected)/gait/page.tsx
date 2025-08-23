'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const GaitRedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct gait analysis page
    router.replace('/gait-analysis');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Redirecting to Gait Analysis...</span>
      </div>
    </div>
  );
};

export default GaitRedirectPage;