import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Send, Lightbulb } from 'lucide-react';
import Header from '../components/Header';
import InspectorFields from '../components/InspectorFields';
import { useIdeas } from '../context/IdeasContext';
import { useInspectorForm } from '../hooks/useInspectorForm';

const priorities = [
  { label: 'عالية', value: 'high' },
  { label: 'متوسطة', value: 'medium' },
  { label: 'منخفضة', value: 'low' },
];

const AddIdeaPage = () => {
  const navigate = useNavigate();
  const { addIdea } = useIdeas();
  const inspectorForm = useInspectorForm();

  const [form, setForm] = useState({
    title: '',
    description: '',
    project: '',
    priority: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const isValid = form.title.trim() && form.description.trim() && form.project.trim();

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || showModal) return;
    const inspector = inspectorForm.validate();
    if (!inspector) return;
    const saved = addIdea({
      title: form.title.trim(),
      description: form.description.trim(),
      project: form.project.trim(),
      priority: form.priority,
      inspector,
    });
    setSaveFailed(!saved);
    if (!saved) return;
    inspectorForm.remember(inspector);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen pb-16 w-full bg-[#F5F6F8]">

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl px-12 py-10 flex flex-col items-center gap-6 z-10 min-w-[320px]">
            {/* Checkmark icon */}
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-9 h-9 text-[#02c31e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-2xl font-black text-[#091040] text-center">تم حفظ فكرتك على هذا الجهاز</h3>
            <p className="text-gray-500 text-sm text-center leading-relaxed">
              تم حفظ الفكرة في هذا المتصفح فقط، ولن تظهر على الأجهزة الأخرى.
            </p>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-[#02c31e] hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/20 text-base"
            >
              العودة إلى الرئيسية
            </button>
          </div>
        </div>
      )}
      <Header />

      <div className="max-w-3xl mx-auto px-6 mt-8">
        {/* Back link */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#091040] mb-8 font-bold transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          العودة إلى المعرض
        </button>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
          <h2 className="text-3xl font-black text-[#091040] mb-2">إضافة فكرة تقنية جديدة</h2>
          <p className="text-gray-500 mb-10 text-base leading-relaxed">
            شارك أفكارك التقنية في التفتيش وقيّم أفضل الحلول والابتكارات للمفتشين. مساهمتك تساعدنا في تطوير بيئة العمل.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">

            {/* العنوان */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                اسم الفكرة التقنية <span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                placeholder="أدخل اسم الفكرة"
                className="w-full border border-gray-200 rounded-xl px-5 py-3.5 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#02c31e] focus:border-transparent placeholder:text-gray-400 transition-all"
              />
            </div>

            {/* الوصف */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                وصف الفكرة التقنية <span className="text-pink-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="اشرح فكرتك بالتفصيل. ما المشكلة التي تحلها وكيف تعمل؟"
                rows={5}
                className="w-full border border-gray-200 rounded-xl px-5 py-3.5 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#02c31e] focus:border-transparent placeholder:text-gray-400 resize-none transition-all"
              />
            </div>

            {/* المشروع */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                المشروع أو القسم <span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                value={form.project}
                onChange={e => handleChange('project', e.target.value)}
                placeholder="مثال: التفتيش الميداني، السلامة..."
                className="w-full border border-gray-200 rounded-xl px-5 py-3.5 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#02c31e] focus:border-transparent placeholder:text-gray-400 transition-all"
              />
            </div>

            {/* الأولوية */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-4">
                الأولوية المقترحة
              </label>
              <div className="flex gap-4">
                {priorities.map(({ label, value }) => {
                  const isSelected = form.priority === value;
                  const colorMap = {
                    high: isSelected ? 'bg-pink-500 text-white border-pink-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300',
                    medium: isSelected ? 'bg-yellow-400 text-white border-yellow-400 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-yellow-300',
                    low: isSelected ? 'bg-blue-500 text-white border-blue-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300',
                  };
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleChange('priority', value)}
                      className={`px-7 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${colorMap[value]}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tips Box */}
            <div className="bg-[#091040] rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-base">نصائح لتقديم فكرة مميزة</span>
              </div>
              <ul className="space-y-2.5 text-blue-100 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0"></span>
                  <span>كن محدداً في تحديد المشكلة الميدانية وآلية معالجتها</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0"></span>
                  <span>اشرح كيف تسهم التقنية في تسهيل عمل المفتش</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0"></span>
                  <span>اذكر الأثر المتوقع على جودة التفتيش وسرعة الإنجاز</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0"></span>
                  <span>حدد القسم أو المجال المستهدف (تفتيش ميداني، سلامة، الخ)</span>
                </li>
              </ul>
            </div>

            <InspectorFields form={inspectorForm} />

            {saveFailed && (
              <p role="alert" className="text-sm font-bold text-pink-600">
                تعذّر حفظ الفكرة في هذا المتصفح، ولم يتم تسجيلها. يرجى المحاولة مرة أخرى.
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              {/* RIGHT in RTL: primary submit button */}
              <button
                type="submit"
                disabled={!isValid}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold text-base transition-all ${
                  isValid
                    ? 'bg-[#02c31e] text-white hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/20'
                    : 'bg-[#e0e4eb] text-[#a0abbd] cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
                إرسال الفكرة
              </button>

              {/* LEFT in RTL: secondary cancel button */}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-8 py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                إلغاء
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddIdeaPage;
