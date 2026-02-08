import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';

const HomePage = lazy(() => import('./pages/HomePage'));
const PlannerPage = lazy(() => import('./pages/PlannerPage'));
const KostenPage = lazy(() => import('./pages/KostenPage'));
const QuotePage = lazy(() => import('./pages/QuotePage'));
const AdviesPage = lazy(() => import('./pages/AdviesPage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const VoorwaardenPage = lazy(() => import('./pages/VoorwaardenPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const SuspenseFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
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
        <Route path="badkamer-renovatie-kosten" element={<KostenPage />} />
        <Route path="offerte-aanvragen" element={<QuotePage />} />
        <Route path="advies" element={<AdviesPage />} />
        <Route path="advies/:slug" element={<ArticlePage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="voorwaarden" element={<VoorwaardenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
