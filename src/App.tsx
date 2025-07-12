import React from 'react';
import { useUser } from '@clerk/clerk-react';
import Login from './components/Login';
import AuthenticatedApp from './components/AuthenticatedApp';

function App() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-lg text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Login />;
  }

  return <AuthenticatedApp />;
}

export default App;