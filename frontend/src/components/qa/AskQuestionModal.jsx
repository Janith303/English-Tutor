import React, { useState } from 'react';
import { X } from 'lucide-react';

const AskQuestionModal = ({ onClose }) => {
  const [formData, setFormData] = useState({ title: '', body: '', tags: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Question title is required";
    } else if (formData.title.length < 10) {
      newErrors.title = "Title must be at least 10 characters";
    }

    if (!formData.body.trim()) {
      newErrors.body = "Please provide more details for your question";
    } else if (formData.body.length < 20) {
      newErrors.body = "Body must be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Submitted:", formData);
      alert("Question posted successfully! (Frontend Only)");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-slate-700">Ask a Question</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Title</label>
            <p className="text-xs text-slate-500 mb-2">Be specific and imagine you’re asking a question to a lecturer.</p>
            <input 
              type="text" 
              className={`w-full border rounded-lg p-3 outline-none transition-all ${errors.title ? 'border-red-500 ring-1 ring-red-100' : 'focus:ring-2 focus:ring-blue-500 border-slate-200'}`}
              placeholder="e.g. When should I use the Present Perfect tense?"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            {errors.title && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.title}</span>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Details</label>
            <textarea 
              rows="6"
              className={`w-full border rounded-lg p-3 outline-none transition-all ${errors.body ? 'border-red-500 ring-1 ring-red-100' : 'focus:ring-2 focus:ring-blue-500 border-slate-200'}`}
              placeholder="Include all the information someone would need to answer your question..."
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
            ></textarea>
            {errors.body && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.body}</span>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Tags</label>
            <input 
              type="text" 
              className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. grammar, tenses, essay-writing (comma separated)"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-95">Post Question</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskQuestionModal;