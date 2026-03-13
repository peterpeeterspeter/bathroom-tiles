import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Analytics } from '@vercel/analytics/react';

const HomePage = lazy(() => import('./pages/HomePage'));
const PlannerPage = lazy(() => import('./pages/PlannerPage'));
const KostenPage = lazy(() => import('./pages/KostenPage'));
const QuotePage = lazy(() => import('./pages/QuotePage'));
const AdviesPage = lazy(() => import('./pages/AdviesPage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const InspiratiePage = lazy(() => import('./pages/InspiratiePage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const VoorwaardenPage = lazy(() => import('./pages/VoorwaardenPage'));
const VoorVakmensenPage = lazy(() => import('./pages/VoorVakmensenPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const SuspenseFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <>
      <Routes>
        <Route 
          path="/planner" 
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <PlannerPage />
            </Suspense>
          } 
        />
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="tile-costs" element={<KostenPage />} />
          <Route path="get-quote" element={<QuotePage />} />
          <Route path="inspiration" element={<InspiratiePage />} />
          <Route path="advice" element={<AdviesPage />} />
          <Route path="advice/:slug" element={<ArticlePage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<VoorwaardenPage />} />
          <Route path="for-contractors" element={<VoorVakmensenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Analytics />
    </>
  );
}
