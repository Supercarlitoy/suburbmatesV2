"use client";

import { AlertTriangle } from 'lucide-react';

interface SessionWarningProps {
  timeRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
}

export function SessionWarning({ 
  timeRemaining, 
  onExtend, 
  onLogout 
}: SessionWarningProps) {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Session Expiring Soon
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              Your session will expire in {timeRemaining} minute{timeRemaining !== 1 ? 's' : ''} due to inactivity.
            </p>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={onExtend}
                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-3 py-1 rounded text-sm font-medium"
              >
                Stay Active
              </button>
              <button
                onClick={onLogout}
                className="bg-transparent text-yellow-800 hover:bg-yellow-100 px-3 py-1 rounded text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}