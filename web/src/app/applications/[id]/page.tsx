import React, { Suspense } from 'react';
import { initialApplications } from '../../../data/initial-applications';
import { ApplicationDetailClient } from './ApplicationDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return initialApplications.map((app) => ({
    id: app.id,
  }));
}

async function ApplicationDetailLoader({ params }: PageProps) {
  const { id } = await params;
  return <ApplicationDetailClient applicationId={id} />;
}

export default function ApplicationDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-300">விண்ணப்ப விவரங்கள் ஏற்றப்படுகின்றன...</p>
          </div>
        </div>
      }
    >
      <ApplicationDetailLoader params={params} />
    </Suspense>
  );
}
