'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ title, description, children }) => {
  return (
    <div className="flex h-screen w-full bg-canvas overflow-hidden">
      {/* Left Rail Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopBar title={title} description={description} />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-20 md:pb-8">
          <div className="max-w-[1440px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};
