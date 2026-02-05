import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout = () => {
  const location = useLocation();
  const isPlannerPage = location.pathname === '/planner';

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      {!isPlannerPage && <Header />}
      <main className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
      {!isPlannerPage && <Footer />}
    </div>
  );
};
