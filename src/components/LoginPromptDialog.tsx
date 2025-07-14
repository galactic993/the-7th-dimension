import React from 'react';
import { useClerk } from '@clerk/clerk-react';
import { X } from 'lucide-react';

interface LoginPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const LoginPromptDialog: React.FC<LoginPromptDialogProps> = ({ isOpen, onClose, message }) => {
  const { openSignIn } = useClerk();

  if (!isOpen) return null;

  const handleLogin = () => {
    openSignIn();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">ログインが必要です</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex gap-3">
          <button
            onClick={handleLogin}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ログインする
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptDialog;