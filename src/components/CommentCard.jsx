import React from 'react';
import { Star, User } from 'lucide-react';
import { formatDate } from '../utils/ideaHelpers';

const CommentCard = ({ comment }) => {
  const { comment: text, stars, createdAt, inspector } = comment;

  // Generate stars based on rating
  const renderStars = () => {
    const icons = [];
    for (let i = 1; i <= 5; i++) {
      icons.push(
        <Star
          key={i}
          className={`w-5 h-5 ${i <= stars ? 'fill-[#02c31e] text-[#02c31e]' : 'text-gray-300'}`}
        />
      );
    }
    return icons;
  };

  return (
    <div className="border-b border-gray-100 last:border-0 py-6">
      <div className="flex justify-between items-start mb-3">
        {/* Author info (Right side in RTL) */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-[#02c31e]">
            <User className="w-5 h-5" />
          </div>
          <div>
            {/* Ratings saved before inspector details existed have no inspector */}
            <h4 className="font-bold text-[#091040] text-sm">{inspector?.name ?? 'تقييم بدون اسم'}</h4>
            {inspector && (
              <div className="text-xs text-gray-500">
                الرقم التعريفي: <span dir="ltr" className="whitespace-nowrap">{inspector.inspectorId}</span>
              </div>
            )}
            <span className="text-xs text-gray-400">{formatDate(createdAt)}</span>
          </div>
        </div>

        {/* Rating stars (Left side in RTL) */}
        <div className="flex gap-1">
          {renderStars()}
        </div>
      </div>

      {/* Comment text */}
      {text && (
        <p className="text-gray-600 text-sm leading-relaxed mb-4 pr-14 text-right">
          {text}
        </p>
      )}
    </div>
  );
};

export default CommentCard;
