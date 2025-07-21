import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface ConvexImageProps {
  storageId: string;
  alt?: string;
  className?: string;
  fallback?: string;
}

const ConvexImage: React.FC<ConvexImageProps> = ({ 
  storageId, 
  alt = '', 
  className = '', 
  fallback = '/images/default.png' 
}) => {
  // Check if storageId is a valid Convex storage ID
  const isConvexStorageId = storageId && storageId.startsWith('k');
  
  const imageUrl = useQuery(
    api.posts.getFileUrl, 
    isConvexStorageId ? { storageId: storageId as Id<"_storage"> } : "skip"
  );

  // If it's not a Convex storage ID, use it as a direct URL
  if (!isConvexStorageId) {
    return (
      <img
        src={storageId}
        alt={alt}
        className={className}
        onError={(e) => {
          e.currentTarget.src = fallback;
        }}
      />
    );
  }

  // If we're still loading the URL from Convex storage
  if (imageUrl === undefined) {
    return (
      <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-sm">読み込み中...</div>
      </div>
    );
  }

  // If we couldn't get the URL, show fallback
  if (!imageUrl) {
    return (
      <img
        src={fallback}
        alt={alt}
        className={className}
      />
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.src = fallback;
      }}
    />
  );
};

export default ConvexImage;