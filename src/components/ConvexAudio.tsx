import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Download } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

interface ConvexAudioProps {
  storageId?: string;
  audioUrl?: string;  
  alt?: string;
  className?: string;
  showControls?: boolean;
  showDownload?: boolean;
}

const ConvexAudio: React.FC<ConvexAudioProps> = ({
  storageId,
  audioUrl,
  alt = "Audio",
  className = "",
  showControls = true,
  showDownload = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  // ConvexからファイルのURLを取得（storageIdが提供された場合のみ）
  const convexFileUrl = useQuery(
    api.posts.getFileUrl, 
    storageId ? { storageId: storageId as Id<"_storage"> } : "skip"
  );
  
  // 最終的なファイルURL決定
  const fileUrl = audioUrl || convexFileUrl;

  // デバッグログ
  console.log('ConvexAudio DEBUG:', {
    storageId,
    audioUrl,
    convexFileUrl,
    fileUrl,
    isLoading,
    componentState: 'rendering'
  });


  useEffect(() => {
    console.log('useEffect triggered:', { audioRef: !!audioRef.current, fileUrl });
    if (!audioRef.current || !fileUrl) {
      console.log('useEffect early return:', { audioRef: !!audioRef.current, fileUrl });
      return;
    }

    const audio = audioRef.current;
    
    // 読み込み状態をリセット
    setIsLoading(true);
    setError(null);
    
    const handleLoadedMetadata = () => {
      console.log('Audio loaded successfully - loadedmetadata');
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      console.error('Audio load error:', e, audio.error);
      setError('音声ファイルの読み込みに失敗しました');
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      console.log('Audio can play');
      if (audio.duration) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      console.log('Audio load start');
    };

    const handleLoadedData = () => {
      console.log('Audio data loaded');
      setIsLoading(false);
    };

    // タイムアウト設定
    const loadTimeout = setTimeout(() => {
      console.warn('Audio load timeout');
      setError('音声ファイルの読み込みがタイムアウトしました');
      setIsLoading(false);
    }, 15000); // 15秒でタイムアウト

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // srcを設定してから読み込み開始
    audio.src = fileUrl;
    audio.load();

    return () => {
      clearTimeout(loadTimeout);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [fileUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newVolume = parseFloat(e.target.value) / 100;
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (!fileUrl) return;
    
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = alt || 'audio';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className={`flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="text-red-600">
          <Volume2 className="w-6 h-6" />
        </div>
        <div className="text-red-700 text-sm">{error}</div>
      </div>
    );
  }

  if (!fileUrl) {
    return (
      <div className={`flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="animate-pulse">
          <Volume2 className="w-6 h-6 text-gray-400" />
        </div>
        <div className="text-gray-500 text-sm">
          音声ファイルURLを取得中... (Debug: storageId={storageId}, convexFileUrl={convexFileUrl ? 'exists' : 'null'})
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        preload="auto"
        crossOrigin="anonymous"
      />

      {/* Play/Pause button */}
      {showControls && (
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className={`flex items-center justify-center w-10 h-10 ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
          } text-white rounded-full transition-colors`}
        >
          {isLoading ? (
            <Volume2 className="w-5 h-5 animate-pulse" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>
      )}

      {/* Progress and time */}
      <div className="flex-1 space-y-2">
        {showControls && (
          <>
            <input
              type="range"
              min="0"
              max="100"
              value={duration > 0 ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              disabled={isLoading}
              className={`w-full h-2 bg-gray-200 rounded-lg appearance-none ${
                isLoading ? 'cursor-not-allowed' : 'cursor-pointer'
              } slider`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{isLoading ? '--:--' : formatTime(currentTime)}</span>
              <span>{isLoading ? '読み込み中...' : formatTime(duration)}</span>
            </div>
          </>
        )}
        
        {!showControls && (
          <div className="flex items-center space-x-2">
            <Volume2 className={`w-5 h-5 text-gray-500 ${isLoading ? 'animate-pulse' : ''}`} />
            <span className="text-sm text-gray-700">
              {isLoading ? '音声読み込み中...' : alt}
            </span>
          </div>
        )}
      </div>

      {/* Volume control */}
      {showControls && (
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-gray-500" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
            disabled={isLoading}
            className={`w-16 h-2 bg-gray-200 rounded-lg appearance-none ${
              isLoading ? 'cursor-not-allowed' : 'cursor-pointer'
            } slider`}
          />
        </div>
      )}

      {/* Download button */}
      {showDownload && (
        <button
          onClick={handleDownload}
          disabled={isLoading}
          className={`p-2 rounded-full transition-colors ${
            isLoading 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          title={isLoading ? '読み込み中...' : 'ダウンロード'}
        >
          <Download className="w-4 h-4" />
        </button>
      )}

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default ConvexAudio;