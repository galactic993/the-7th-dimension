import React from 'react';
import { LogOut, LogIn } from 'lucide-react';
import { useClerk, useUser } from '@clerk/clerk-react';

const Header: React.FC = () => {
  const { signOut, openSignIn } = useClerk();
  const { isSignedIn } = useUser();
  
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-100/90 via-violet-50/90 to-purple-100/90 backdrop-blur-md border-b border-purple-200/50">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              星のステージ
            </h1>
          </div>


          {/* Auth Button */}
          <div className="flex-shrink-0">
            {isSignedIn ? (
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium hidden xs:inline">ログアウト</span>
              </button>
            ) : (
              <button
                onClick={() => openSignIn()}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">ログイン</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;