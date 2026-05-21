import React, { useState } from 'react';
import { Sidebar, TabType } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Courses } from './pages/Courses';
import { AiTutor } from './pages/AiTutor';
import { KnowledgeGraph } from './pages/KnowledgeGraph';
import { EmbodiedAI } from './pages/EmbodiedAI';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { RoleSelection, UserRole } from './pages/RoleSelection';
import { SecuritySettings } from './pages/SecuritySettings';
import { Paper } from './pages/Paper';
import { Toaster } from 'sonner';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentTab('dashboard');
  };

  if (!isLoggedIn) {
    return (
      <>
        <Login onLogin={() => setIsLoggedIn(true)} />
        <Toaster theme="dark" position="top-right" />
      </>
    );
  }

  // Onboarding: If logged in but no role selected, show RoleSelection
  if (isLoggedIn && !userRole) {
    return (
      <>
        <RoleSelection onSelect={(role) => setUserRole(role)} />
        <Toaster theme="dark" position="top-right" />
      </>
    );
  }

  return (
    <div className="flex bg-[#05070A] h-screen text-slate-200 font-sans selection:bg-blue-900 selection:text-white pb-safe overflow-hidden">
      <Sidebar currentTab={currentTab} setTab={setCurrentTab} onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-10 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && <Dashboard />}
          {currentTab === 'courses' && <Courses />}
          {currentTab === 'knowledge-graph' && <KnowledgeGraph />}
          {currentTab === 'embodied-ai' && <EmbodiedAI />}
          {currentTab === 'ai-tutor' && <AiTutor />}
          {currentTab === 'profile' && <Profile userRole={userRole || undefined} onNavigate={(tab) => setCurrentTab(tab)} />}
          {currentTab === 'security-settings' && <SecuritySettings />}
          {currentTab === 'paper' && <Paper />}
        </main>
      </div>
      <Toaster theme="dark" position="top-right" toastOptions={{
        className: 'bg-slate-900 border-slate-800 text-slate-200',
        descriptionClassName: 'text-slate-500'
      }} />
    </div>
  );
}
