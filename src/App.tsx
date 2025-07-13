import React from 'react';
import { useUser } from '@clerk/clerk-react';
import MainApp from './components/MainApp';

function App() {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="starry-background">
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="shooting-star"></div>
          <div className="shooting-star"></div>
          <div className="shooting-star"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white opacity-80"></div>
          <p className="mt-4 text-lg text-white opacity-90">読み込み中...</p>
        </div>
      </div>
    );
  }

  return <MainApp />;
}

export default App;