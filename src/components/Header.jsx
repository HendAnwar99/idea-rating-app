import React from 'react';
import { ChevronRight } from 'lucide-react';

const Header = () => {
  return (
    <div className="bg-[#091040] text-white w-full border-b border-[#091040]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Top Nav Area */}
        <div className="flex justify-between items-center mb-16 text-sm">
          {/* Right side in RTL (start of flex) */}
          <div className="text-2xl font-black flex items-center leading-none tracking-tight pt-1">
            تطبيق تقييم الأفكار
          </div>

          {/* Left side in RTL (end of flex) */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-gray-300">
              <span className="font-bold text-white text-base">معرض الأفكار التقنية</span>
              <span className="text-lg pb-1">&larr;</span>
              <span className="text-base text-gray-300">نظام تقييم الأفكار التقنية للمفتشين</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
            نظام تقييم الأفكار التقنية للمفتشين
          </h1>
          <p className="text-blue-100/80 text-lg md:text-xl leading-relaxed max-w-2xl font-medium">
            شارك أفكارك التقنية في التفتيش وقيّم أفضل الحلول والابتكارات للمفتشين
          </p>
        </div>
      </div>
    </div>
  );
};

export default Header;
