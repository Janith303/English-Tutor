import React, { useState } from 'react';
import { X, Send, Check } from 'lucide-react';
import axios from 'axios';

const AskQuestionModal = ({ onClose, onQuestionAdded }) => {
  const categories = [
    "Grammar", 
    "IELTS Prep", 
    "Academic Writing", 
    "Presentation Skills", 
    "Interview Prep", 
    "Vocabulary"
  ];

  const [formData, setFormData] = useState({ 
    title: '', 
    body: '', 
    tags: '', // We will store these as a comma-separated string
    is_anonymous: false 
  });
  
  const [selectedTags, setSelectedTags] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle tag selection
  const toggleTag = (tag) => {
    let newTags;
    if (selectedTags.includes(tag)) {
      newTags = selectedTags.filter(t => t !== tag);
    } else {
      newTags = [...selectedTags, tag];
    }
    setSelectedTags(newTags);
    // Join them with commas so the backend Signal can split them easily
    setFormData({ ...formData, tags: newTags.join(', ') });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Question title is required";
    if (!formData.body.trim()) newErrors.body = "Please provide more details";
    if (selectedTags.length === 0) newErrors.tags = "Please select at least one category";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        "http://127.0.0.1:8000/api/wall-questions/", 
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onQuestionAdded) onQuestionAdded(response.data);
      onClose();
    } catch (err) {
      setErrors({ server: "Failed to post question." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
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
            <input 
              type="text" 
              className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Tips for academic writing flow?"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            {errors.title && <span className="text-red-500 text-xs mt-1 block">{errors.title}</span>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Details</label>
            <textarea 
              rows="3"
              className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your issue..."
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
            ></textarea>
            {errors.body && <span className="text-red-500 text-xs mt-1 block">{errors.body}</span>}
          </div>

          {/* --- UPDATED TAG SELECTION --- */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">Select Category (Routing)</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 border ${
                    selectedTags.includes(tag)
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {selectedTags.includes(tag) && <Check size={12} />}
                  {tag}
                </button>
              ))}
            </div>
            {errors.tags && <span className="text-red-500 text-xs mt-2 block">{errors.tags}</span>}
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <input 
              type="checkbox"
              id="is_anonymous"
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              checked={formData.is_anonymous}
              onChange={(e) => setFormData({...formData, is_anonymous: e.target.checked})}
            />
            <label htmlFor="is_anonymous" className="text-sm font-medium text-slate-600 cursor-pointer">
              Post anonymously
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 text-slate-600 font-medium">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {isSubmitting ? "Posting..." : <><Send size={18}/> Post Question</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskQuestionModal;