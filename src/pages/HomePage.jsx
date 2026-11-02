import React, { useState } from 'react';
import { Trophy, Plus, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import IdeaCard from '../components/IdeaCard';
import { useIdeas } from '../context/IdeasContext';
import { useVotes } from '../context/VotesContext';
import { averageRating } from '../utils/ideaHelpers';

const sortOptions = ['الأكثر تصويتاً', 'الأعلى تقييماً', 'الأحدث'];

const HomePage = () => {
  const navigate = useNavigate();
  const { ideas, removeIdea } = useIdeas();
  const { getVoteCount } = useVotes();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [ideaToDelete, setIdeaToDelete] = useState(null);
  const [deleteFailed, setDeleteFailed] = useState(false);

  const closeDeleteModal = () => {
    setIdeaToDelete(null);
    setDeleteFailed(false);
  };

  const confirmDelete = () => {
    if (removeIdea(ideaToDelete.id)) {
      closeDeleteModal();
    } else {
      setDeleteFailed(true);
    }
  };

  const newestFirst = (a, b) => b.createdAt.localeCompare(a.createdAt);
  const comparators = {
    [sortOptions[0]]: (a, b) => getVoteCount(b.id) - getVoteCount(a.id) || newestFirst(a, b),
    [sortOptions[1]]: (a, b) => averageRating(b.ratings) - averageRating(a.ratings) || newestFirst(a, b),
    [sortOptions[2]]: newestFirst,
  };
  const sortedIdeas = [...ideas].sort(comparators[selectedSort]);

  return (
    <div className="min-h-screen pb-12 w-full bg-[#F5F6F8]">
      {/* Delete Confirmation Modal */}
      {ideaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDeleteModal} />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-idea-title"
            className="relative bg-white rounded-2xl shadow-2xl px-8 py-8 flex flex-col items-center gap-5 z-10 w-full max-w-md"
          >
            <h3 id="delete-idea-title" className="text-2xl font-black text-[#091040] text-center">حذف هذه الفكرة؟</h3>
            <p className="font-bold text-[#091040] text-center break-words w-full">{ideaToDelete.title}</p>
            <p className="text-gray-500 text-sm text-center leading-relaxed">
              سيتم حذف الفكرة وتقييماتها وتعليقاتها نهائيًا من هذا المتصفح، ولا يمكن التراجع عن ذلك.
            </p>

            {deleteFailed && (
              <p role="alert" className="text-sm font-bold text-pink-600 text-center">
                تعذّر حذف الفكرة. يرجى المحاولة مرة أخرى.
              </p>
            )}

            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                حذف الفكرة
              </button>
              <button
                type="button"
                autoFocus
                onClick={closeDeleteModal}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <Header />

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Controls Bar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-8 flex items-center justify-between border border-gray-100">

          {/* Right side in RTL (Title) */}
          <div className="flex items-center gap-2">
            <Trophy className="w-7 h-7 text-orange-500" />
            <h2 className="text-2xl font-bold text-[#091040]">أفضل 10 أفكار تقنية للمفتشين</h2>
          </div>

          {/* Left side in RTL (Dropdown + Button) */}
          <div className="flex items-center gap-4">

            {/* Sort Dropdown */}
            <div className="relative flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-500">ترتيب حسب :</span>

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-between w-44 gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#02c31e]/50 transition-colors font-medium text-sm text-gray-700 shadow-sm"
                >
                  <span className="truncate">{selectedSort}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden py-1">
                    {sortOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSelectedSort(option);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-right px-4 py-2.5 text-sm font-medium flex items-center justify-between transition-colors hover:bg-gray-50 ${
                          selectedSort === option
                            ? 'text-[#02c31e] bg-green-50/50'
                            : 'text-gray-700'
                        }`}
                      >
                        {option}
                        {selectedSort === option && <Check className="w-4 h-4 text-[#02c31e]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Green Button */}
            <button
              onClick={() => navigate('/add-idea')}
              className="bg-[#02c31e] hover:bg-green-600 transition-colors text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm text-sm">
              <Plus className="w-5 h-5" />
              إضافة فكرة تقنية جديدة
            </button>

          </div>
        </div>

        {sortedIdeas.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <h3 className="text-xl font-bold text-[#091040] mb-2">لا توجد أفكار مسجلة حتى الآن</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              شارك أول فكرة عبر زر «إضافة فكرة تقنية جديدة».
            </p>
          </div>
        ) : (
          /* Grid of Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sortedIdeas.map((idea, index) => (
              <IdeaCard key={idea.id} idea={idea} rank={index + 1} onDelete={setIdeaToDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
