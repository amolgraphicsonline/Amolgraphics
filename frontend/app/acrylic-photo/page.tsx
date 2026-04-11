"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AcrylicPhotoRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Construct the new URL for studio-v2 with all existing parameters
    const params = new URLSearchParams(searchParams.toString());
    router.replace(`/studio-v2?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-[12px]  capitalize tracking-[0.3em] text-slate-400">Loading Enhanced Studio...</p>
      </div>
    </div>
  );
}
