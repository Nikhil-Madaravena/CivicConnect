import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/auth/AuthForm';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { ReportForm } from './components/citizen/ReportForm';
import { ReportsList } from './components/citizen/ReportsList';
import { Dashboard } from './components/admin/Dashboard';
import { ReportsManager } from './components/admin/ReportsManager';

const AppContent: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CivicConnect...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthForm />;
  }

  const renderContent = () => {
    if (profile.role === 'citizen') {
      switch (activeTab) {
        case 'home':
          return (
            <div className="space-y-8">
              <ReportForm onSubmit={() => setActiveTab('reports')} />
            </div>
          );
        case 'reports':
          return <ReportsList />;
        default:
          return <div>Page not found</div>;
      }
    } else {
      switch (activeTab) {
        case 'home':
        case 'dashboard':
          return <Dashboard />;
        case 'manage':
          return <ReportsManager />;
        default:
          return <div>Page not found</div>;
      }
    }
  };

  const getPageTitle = () => {
    if (profile.role === 'citizen') {
      return activeTab === 'home' ? 'CivicConnect' : 'My Reports';
    } else {
      return activeTab === 'manage' ? 'Manage Reports' : 'Admin Dashboard';
    }
  };

  const getPageSubtitle = () => {
    if (profile.role === 'citizen') {
      return activeTab === 'home' 
        ? 'Report civic issues in your community' 
        : 'Track the progress of your submitted reports';
    } else {
      return activeTab === 'manage' 
        ? 'Review and manage citizen reports' 
        : 'Overview of civic issues and performance metrics';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={getPageTitle()} 
        subtitle={getPageSubtitle()} 
      />
      
      <Navigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={profile.role}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;