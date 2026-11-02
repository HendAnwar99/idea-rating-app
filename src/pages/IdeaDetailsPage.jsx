import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Check, ArrowRight, Calendar, Tag, Building2, User } from 'lucide-react';
import Header from '../components/Header';
import CommentCard from '../components/CommentCard';
import InspectorFields from '../components/InspectorFields';
import { useIdeas } from '../context/IdeasContext';
import { useVotes } from '../context/VotesContext';
import { useInspectorForm } from '../hooks/useInspectorForm';
import { averageRating, formatDate } from '../utils/ideaHelpers';

const priorityTags = {
  high: { label: 'أولوية عالية', color: 'bg-pink-500 text-white' },
  medium: { label: 'أولوية متوسطة', color: 'bg-yellow-400 text-white' },
  low: { label: 'أولوية منخفضة', color: 'bg-blue-500 text-white' },
};

const IdeaDetailsPage = () => {
  const { id: ideaId } = useParams();
  const navigate = useNavigate();
  const { getIdea, addRating } = useIdeas();
  const { getVoteCount, hasVoted, toggleVote } = useVotes();
  const inspectorForm = useInspectorForm();

  const idea = getIdea(ideaId);
  const voted = hasVoted(ideaId);
  const totalVotes = getVoteCount(ideaId);

  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const canSubmitRating = userRating > 0 && !ratingSubmitted;

  const handleSubmitRating = () => {
    if (!canSubmitRating) return;
    const inspector = inspectorForm.validate();
    if (!inspector) return;
    const saved = addRating(ideaId, { stars: userRating, comment: comment.trim(), inspector });
    setSaveFailed(!saved);
    if (!saved) return;
    inspectorForm.remember(inspector);
    setRatingSubmitted(true);
    setShowRatingModal(true);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Star
        key={idx}
        className={`w-6 h-6 ${idx < Math.floor(rating) ? 'fill-[#02c31e] text-[#02c31e]' : 'text-gray-200'}`}
      />
    ));
  };

  const renderInteractiveStars = () => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Star
        key={idx}
        onClick={() => !ratingSubmitted && setUserRating(idx + 1)}
        className={`w-6 h-6 transition-transform ${ratingSubmitted ? 'cursor-default' : 'cursor-pointer hover:scale-110'} ${idx < userRating ? 'fill-[#02c31e] text-[#02c31e]' : 'text-gray-200'}`}
      />
    ));
  };

  if (!idea) {
    return (
      <div className="min-h-screen pb-12 w-full bg-[#F5F6F8]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Header />
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-[#091040] mb-8 font-bold transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            العودة إلى المعرض
          </button>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <h1 className="text-xl font-bold text-[#091040] mb-2">لم يتم العثور على هذه الفكرة</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              تُحفظ الأفكار في المتصفح الذي أُضيفت منه فقط، لذلك قد لا تظهر هنا إذا أُضيفت من جهاز آخر.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const ratingCount = idea.ratings.length;
  const average = averageRating(idea.ratings);
  const priorityTag = priorityTags[idea.priority];

  return (
    <div className="min-h-screen pb-12 w-full bg-[#F5F6F8]">

      {/* ─── Rating Success Modal ─── */}
      {showRatingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowRatingModal(false)}
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl px-10 py-10 flex flex-col items-center gap-5 z-10 w-full max-w-md mx-4">
            {/* Green check icon */}
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-9 h-9 text-[#02c31e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-black text-[#091040] mb-3">
                تم حفظ تقييمك على هذا الجهاز
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                شكرًا لمشاركتك رأيك. تم حفظ التقييم في هذا المتصفح فقط، ولن يظهر على الأجهزة الأخرى.
              </p>
            </div>

            {/* Buttons: primary right, secondary left (RTL) */}
            <div className="flex w-full gap-3 mt-2">
              {/* RIGHT in RTL: stay on page */}
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 bg-[#02c31e] hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/20 text-sm"
              >
                العودة إلى الفكرة
              </button>

              {/* LEFT in RTL: go home */}
              <button
                onClick={() => navigate('/')}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all text-sm"
              >
                الذهاب للرئيسية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Header />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#091040] mb-8 font-bold transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          العودة إلى المعرض
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

          {/* RIGHT COLUMN */}
          <div className="md:col-span-8 flex flex-col gap-8">

            {/* Main Detail Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 pt-10">
              {priorityTag && (
                <div className="flex gap-2 mb-6">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${priorityTag.color}`}>
                    {priorityTag.label}
                  </span>
                </div>
              )}

              <h1 className="text-4xl font-black text-[#091040] mb-6 leading-tight">
                {idea.title}
              </h1>

              <p className="text-gray-500 mb-10 text-lg leading-relaxed">
                {idea.description}
              </p>

              {/* Dark Metadata Box */}
              <div className="bg-[#091040] text-white rounded-2xl p-8 grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-xs text-blue-200/80 mb-1">القسم</div>
                      <div className="font-semibold text-blue-50 text-sm">{idea.project}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-xs text-blue-200/80 mb-1">مقدم من</div>
                      <div className="font-semibold text-blue-50 text-sm">{idea.inspector.name}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {idea.inspector.inspectorId && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center shrink-0">
                        <Tag className="w-5 h-5 text-blue-300" />
                      </div>
                      <div>
                        <div className="text-xs text-blue-200/80 mb-1">الرقم التعريفي للمفتش</div>
                        <div dir="ltr" className="font-semibold text-blue-50 text-sm text-right">{idea.inspector.inspectorId}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-xs text-blue-200/80 mb-1">تاريخ التقديم</div>
                      <div className="font-semibold text-blue-50 text-sm">{formatDate(idea.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Users / Projects Chips */}
              <div className="flex items-center justify-start gap-3 pt-4">
                <span className="text-sm font-bold text-[#091040]">المشروع والمستخدم</span>
                <div className="flex gap-2">
                  {[idea.project, idea.inspector.name].map((user, idx) => (
                    <span key={idx} className={`px-4 py-1.5 rounded-full text-xs font-bold ${idx === 0 ? 'bg-blue-50 text-blue-600' : 'bg-pink-100 text-pink-700'}`}>
                      {user}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-[#091040] mb-8">
                تقييمات المفتشين ({ratingCount})
              </h2>
              {ratingCount === 0 ? (
                <p className="text-gray-500 text-sm">لا توجد تقييمات حتى الآن</p>
              ) : (
                <div className="flex flex-col">
                  {idea.ratings.map(rating => (
                    <CommentCard key={rating.id} comment={rating} />
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* LEFT COLUMN: sticky sidebar */}
          <div className="md:col-span-4 flex flex-col gap-8">

            {/* Current Rating */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">
              <h3 className="w-full text-right font-bold text-[#091040] text-lg mb-6">التقييم الحالي</h3>

              <div className="text-7xl font-black text-[#091040] mb-4 tracking-tighter"
                style={{ transition: 'all 0.3s ease' }}
                key={totalVotes}
              >{ratingCount === 0 ? '—' : average.toFixed(1)}</div>
              <div className="flex gap-1.5 mb-3">
                {renderStars(average)}
              </div>
              <div className="text-sm font-medium text-gray-500 mb-8">
                {ratingCount === 0 ? 'لا توجد تقييمات حتى الآن' : `بناءً على ${ratingCount} تقييم`}
                {' · '}
                <span
                  key={totalVotes}
                  className="font-bold text-[#091040] inline-block"
                  style={{ animation: voted ? 'countPop 0.35s ease-out' : 'none' }}
                >
                  {totalVotes}
                </span>
                {' '}تصويت
              </div>

              <button
                onClick={() => toggleVote(ideaId)}
                className={`w-full py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  voted
                    ? 'bg-gray-200 text-gray-600 shadow-inner'
                    : 'bg-[#02c31e] text-white hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/20'
                }`}
              >
                {voted ? (
                  <>
                    <Check className="w-6 h-6" />
                    تم التصويت
                  </>
                ) : (
                  <>
                    <span className="text-2xl pt-1">👍</span> صوت لهذه الفكرة
                  </>
                )}
              </button>
            </div>

            {/* Add Rating Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="font-bold text-[#091040] text-lg mb-8">أضف تقييمك</h3>

              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-gray-600">تقييمك</span>
                <div className="flex gap-1.5">
                  {renderInteractiveStars()}
                </div>
              </div>

              {/* Show count if rating selected */}
              {userRating > 0 && !ratingSubmitted && (
                <p className="text-xs text-gray-400 text-left mb-4">
                  قيّمت بـ {userRating} نجوم
                </p>
              )}

              <div className="mb-6">
                <div className="text-sm font-bold text-gray-600 mb-3">تعليقك</div>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  disabled={ratingSubmitted}
                  className="w-full border border-gray-200 rounded-xl p-4 text-sm font-medium text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#02c31e] focus:border-transparent resize-none h-32 transition-all placeholder:text-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="شارك رأيك حول هذه الفكرة التقنية في التفتيش..."
                />
              </div>

              <div className="mb-6">
                <InspectorFields form={inspectorForm} disabled={ratingSubmitted} />
              </div>

              {saveFailed && (
                <p role="alert" className="text-sm font-bold text-pink-600 mb-4">
                  تعذّر حفظ التقييم في هذا المتصفح، ولم يتم تسجيله. يرجى المحاولة مرة أخرى.
                </p>
              )}

              <button
                onClick={handleSubmitRating}
                disabled={!canSubmitRating}
                className={`w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                  ratingSubmitted
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : canSubmitRating
                      ? 'bg-[#02c31e] text-white hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/20'
                      : 'bg-[#e0e4eb] text-[#a0abbd] cursor-not-allowed'
                }`}
              >
                {ratingSubmitted ? (
                  <>
                    <Check className="w-5 h-5 text-green-500" />
                    تم التقييم ✔
                  </>
                ) : (
                  'إرسال التقييم'
                )}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default IdeaDetailsPage;
