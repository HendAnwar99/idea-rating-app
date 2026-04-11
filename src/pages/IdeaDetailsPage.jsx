import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Check, ArrowRight, Calendar, Tag, Building2, User } from 'lucide-react';
import Header from '../components/Header';
import CommentCard from '../components/CommentCard';
import { useVotes } from '../context/VotesContext';

const ideaDetails = {
  id: 1,
  title: 'مطعم سحابي للأكلات الصحية',
  description: 'مشروع مطعم سحابي متخصص بتقديم وجبات صحية متكاملة بأسعار مناسبة للموظفين.',
  tags: [
    { label: 'أولوية عالية', color: 'bg-pink-500 text-white' },
    { label: 'قيد المراجعة', color: 'bg-orange-500 text-white' }
  ],
  metadata: {
    department: 'وجبات سريعة',
    author: 'سارة',
    classification: 'صحي',
    date: '٢١ رمضان ١٤٤٧ هـ'
  },
  projectUsers: ['شيف', 'خبير تغذية'],
  stats: { rating: 4.8, totalVotes: 156 },
  comments: [
    {
      id: 1,
      author: { name: 'فاطمة', initials: 'F', color: 'bg-[#02c31e]' },
      date: '٢٣ رمضان ١٤٤٧ هـ',
      rating: 5,
      text: 'فكرة ممتازة! وجبات صحية ومناسبة.',
      likes: 23
    },
    {
      id: 2,
      author: { name: 'خالد', initials: 'K', color: 'bg-green-700' },
      date: '٢٤ رمضان ١٤٤٧ هـ',
      rating: 4,
      text: 'الفكرة رائعة، وأعتقد أن التركيز على المكونات العضوية سيزيد من قيمة المشروع.',
      likes: 15
    }
  ]
};

const IdeaDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getVoteCount, hasVoted, toggleVote } = useVotes();

  const ideaId = Number(id) || 1;
  const voted = hasVoted(ideaId);
  const totalVotes = getVoteCount(ideaId);

  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const canSubmitRating = userRating > 0 && !ratingSubmitted;

  const handleSubmitRating = () => {
    if (!canSubmitRating) return;
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
                تم إرسال تقييمك بنجاح 🎉
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                شكرًا لمشاركتك رأيك، تم إضافة تقييمك وسيظهر ضمن تقييمات المستخدمين.
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
              <div className="flex gap-2 mb-6">
                {ideaDetails.tags.map((tag, idx) => (
                  <span key={idx} className={`px-4 py-1.5 rounded-full text-xs font-bold ${tag.color}`}>
                    {tag.label}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl font-black text-[#091040] mb-6 leading-tight">
                {ideaDetails.title}
              </h1>

              <p className="text-gray-500 mb-10 text-lg leading-relaxed">
                {ideaDetails.description}
              </p>

              {/* Dark Metadata Box */}
              <div className="bg-[#091040] text-white rounded-2xl p-8 grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-xs text-blue-200/80 mb-1">نوع الأكلة</div>
                      <div className="font-semibold text-blue-50 text-sm">{ideaDetails.metadata.department}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-xs text-blue-200/80 mb-1">مقدم من</div>
                      <div className="font-semibold text-blue-50 text-sm">{ideaDetails.metadata.author}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center shrink-0">
                      <Tag className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-xs text-blue-200/80 mb-1">التصنيف</div>
                      <div className="font-semibold text-blue-50 text-sm">{ideaDetails.metadata.classification}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-xs text-blue-200/80 mb-1">تاريخ التقديم</div>
                      <div className="font-semibold text-blue-50 text-sm">{ideaDetails.metadata.date}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Users / Projects Chips */}
              <div className="flex items-center justify-start gap-3 pt-4">
                <span className="text-sm font-bold text-[#091040]">نوع الأكلة وصاحب الوصفة</span>
                <div className="flex gap-2">
                  {ideaDetails.projectUsers.map((user, idx) => (
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
                تقييمات المستخدمين ({ideaDetails.comments.length})
              </h2>
              <div className="flex flex-col">
                {ideaDetails.comments.map(comment => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </div>
            </div>

          </div>

          {/* LEFT COLUMN: sticky sidebar */}
          <div className="md:col-span-4 sticky top-8 flex flex-col gap-8">

            {/* Current Rating */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">
              <h3 className="w-full text-right font-bold text-[#091040] text-lg mb-6">التقييم الحالي</h3>

              <div className="text-7xl font-black text-[#091040] mb-4 tracking-tighter"
                style={{ transition: 'all 0.3s ease' }}
                key={totalVotes}
              >{ideaDetails.stats.rating}</div>
              <div className="flex gap-1.5 mb-3">
                {renderStars(ideaDetails.stats.rating)}
              </div>
              <div className="text-sm font-medium text-gray-500 mb-8">
                بناءً على{' '}
                <span
                  key={totalVotes}
                  className="font-bold text-[#091040] inline-block"
                  style={{ animation: totalVotes !== ideaDetails.stats.totalVotes ? 'countPop 0.35s ease-out' : 'none' }}
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
                  placeholder="شارك رأيك حول هذه الأكلة أو الفكرة..."
                />
              </div>

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
