import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { LegalRule } from '../types';
import { Scale, Plus, Edit, Trash, FileText, ShieldAlert, Info } from 'lucide-react';
import { Modal } from '../components/Modal';

const LegalPage: React.FC = () => {
  const { legalRules, addLegalRule, updateLegalRule, settings, currentUser } = useHotel();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<LegalRule | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const canEdit = currentUser?.role === 'manager' || currentUser?.role === 'assistant_manager';

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'hotel_policy', label: 'سياسات الفندق' },
    { id: 'facility_rule', label: 'قواعد المرافق' },
    { id: 'legal_advice', label: 'استشارات قانونية' },
  ];

  const filteredRules = legalRules.filter(rule => 
    activeCategory === 'all' || rule.category === activeCategory
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const ruleData: Partial<LegalRule> = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      category: formData.get('category') as LegalRule['category'],
      isActive: true
    };

    if (editingRule) {
      updateLegalRule(editingRule.id, ruleData);
    } else {
      addLegalRule({
        id: `lr-${Date.now()}`,
        ...ruleData as LegalRule
      });
    }
    setIsModalOpen(false);
    setEditingRule(null);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'hotel_policy': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'facility_rule': return <Info className="w-5 h-5 text-emerald-500" />;
      case 'legal_advice': return <Scale className="w-5 h-5 text-amber-500" />;
      default: return <ShieldAlert className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className={`p-6 min-h-screen ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">السياسات والقوانين</h1>
          <p className="text-gray-500">الدليل القانوني والتنظيمي للفندق والمرافق</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => { setEditingRule(null); setIsModalOpen(true); }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة قانون</span>
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id 
                ? 'bg-primary-600 text-white shadow-lg scale-105' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRules.map(rule => (
          <div key={rule.id} className={`p-6 rounded-2xl border transition-all hover:shadow-md ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-700`}>
                  {getCategoryIcon(rule.category)}
                </div>
                <h3 className="font-bold text-xl">{rule.title}</h3>
              </div>
              {canEdit && (
                <button 
                  onClick={() => { setEditingRule(rule); setIsModalOpen(true); }}
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <p className={`leading-relaxed ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {rule.content}
            </p>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-400">
              <span>{categories.find(c => c.id === rule.category)?.label}</span>
              <span>ID: {rule.id}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRule ? 'تعديل قانون' : 'إضافة قانون جديد'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">العنوان</label>
            <input 
              name="title" 
              defaultValue={editingRule?.title} 
              required 
              className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white transition-colors"
              placeholder="مثال: سياسة التدخين"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">التصنيف</label>
            <select 
              name="category" 
              defaultValue={editingRule?.category || 'hotel_policy'} 
              className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white transition-colors"
            >
              <option value="hotel_policy">سياسات الفندق</option>
              <option value="facility_rule">قواعد المرافق</option>
              <option value="legal_advice">استشارات قانونية</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">المحتوى</label>
            <textarea 
              name="content" 
              defaultValue={editingRule?.content} 
              required 
              rows={6}
              className="w-full p-3 rounded-lg border bg-gray-50 focus:bg-white transition-colors"
              placeholder="اكتب نص القانون أو السياسة هنا..."
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-600/20"
            >
              حفظ
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LegalPage;
