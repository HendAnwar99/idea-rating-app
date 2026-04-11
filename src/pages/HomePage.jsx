import React, { useState } from 'react';
import { Trophy, Plus, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import IdeaCard from '../components/IdeaCard';

const mockIdeas = [
  {
    id: 1,
    rank: 1,
    title: 'مطعم سحابي للأكلات الصحية',
    description: 'مشروع مطعم سحابي متخصص بتقديم وجبات صحية متكاملة بأسعار مناسبة',
    rating: 4,
    votes: 156,
    categories: ['شيف', 'خبير تغذية'],
    author: { name: 'سارة', initials: 'S', color: 'bg-[#02c31e]' },
    date: 'Mar 10, 2026',
    commentsCount: 2,
  },
  {
    id: 2,
    rank: 2,
    title: 'تطبيق يقترح وصفات حسب مكونات المنزل',
    description: 'يساعد التطبيق في تقليل هدر الطعام باقتراح وصفات شهية بناءً على المكونات المتوفرة لديك',
    rating: 4,
    votes: 142,
    categories: ['هاوي طبخ'],
    author: { name: 'أحمد', initials: 'A', color: 'bg-green-600' },
    date: 'Mar 8, 2026',
    commentsCount: 1,
  },
  {
    id: 3,
    rank: 3,
    title: 'وجبات سريعة صحية للموظفين',
    description: 'تقديم خيارات سريعة ولذيذة بديلة للوجبات السريعة التقليدية مع الحفاظ على القيمة الغذائية للموظفين',
    rating: 4,
    votes: 128,
    categories: ['شيف', 'خبير تغذية'],
    author: { name: 'محمد', initials: 'M', color: 'bg-green-700' },
    date: 'Mar 5, 2026',
    commentsCount: 1,
  },
  {
    id: 4,
    rank: 4,
    title: 'حلويات بدون سكر لمرضى السكري',
    description: 'وصفات مبتكرة لتحضير حلويات لذيذة من بدائل صحية تناسب مرضى السكري وأصحاب الدايت',
    rating: 4,
    votes: 119,
    categories: ['خبير تغذية', 'صحي'],
    author: { name: 'نورة', initials: 'N', color: 'bg-green-500' },
    date: 'Mar 7, 2026',
    commentsCount: 0,
  },
  {
    id: 5,
    rank: 5,
    title: 'مطبخ تعليمي للأطفال',
    description: 'منصة تقدم وصفات سهلة وممتعة وآمنة ليشارك الأطفال في تحضيرها وتعلم أساسيات الطبخ',
    rating: 4,
    votes: 107,
    categories: ['هاوي طبخ', 'عائلة'],
    author: { name: 'خالد', initials: 'K', color: 'bg-green-600' },
    date: 'Mar 6, 2026',
    commentsCount: 1,
  },
  {
    id: 6,
    rank: 6,
    title: 'مشاركة وجبات منزلية',
    description: 'منصة تتيح للأشخاص مشاركة الوجبات المنزلية بطريقة آمنة وصحية مع المجتمع',
    rating: 5,
    votes: 95,
    categories: ['شيف', 'هاوي طبخ'],
    author: { name: 'ياسمين', initials: 'Y', color: 'bg-green-500' },
    date: 'Mar 4, 2026',
    commentsCount: 0,
  }
];

const sortOptions = ['الأكثر تصويتاً', 'الأعلى تقييماً', 'الأحدث'];

const HomePage = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);

  return (
    <div className="min-h-screen pb-12 w-full bg-[#F5F6F8]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Controls Bar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-8 flex items-center justify-between border border-gray-100">
          
          {/* Right side in RTL (Title) */}
          <div className="flex items-center gap-2">
            <Trophy className="w-7 h-7 text-orange-500" />
            <h2 className="text-2xl font-bold text-[#091040]">أفضل 10 أفكار أكلات</h2>
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
              إضافة فكرة أكلة جديدة
            </button>
            
          </div>
        </div>

        {/* Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mockIdeas.map(idea => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
