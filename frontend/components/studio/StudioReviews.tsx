import React from 'react';
import { Star } from 'lucide-react';
import PrintshoppyFooter from '@/components/ui/PrintshoppyFooter';

interface StudioReviewsProps {
  globalSettings: any;
  reviewsData?: any;
  API_URL: string;
  resolveMedia: (url: string | null | undefined, base?: string) => string | undefined;
}

const StudioReviews: React.FC<StudioReviewsProps> = ({ globalSettings, reviewsData, API_URL, resolveMedia }) => {
  return (
    <div className="max-w-[1400px] mx-auto mb-20 px-4 md:px-8">
      <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">
              GOOGLE <span className="text-[#1877F2]">REVIEWS</span>
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-2">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={24} fill="#FFB800" className="text-[#FFB800]" />)}
              <span className="font-black text-slate-900 ml-2">4.9/5.0</span>
            </div>
          </div>
          <div className="bg-[#F8F9FA] px-8 py-6 rounded-3xl border border-slate-100 text-center">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Based on</p>
            <p className="text-2xl font-black text-slate-900">1,240+ Reviews</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Rahul Sharma", text: "The photo album quality is amazing. The automatic layout saved me hours of work!", date: "2 days ago" },
            { name: "Priya Patel", text: "Best platform for custom gifts. The Studio V2 editor is very intuitive and fast.", date: "1 week ago" },
            { name: "Ankit Verma", text: "Impressive print quality and fast delivery. Highly recommended for everyone.", date: "3 days ago" }
          ].map((rev, i) => (
            <div key={i} className="bg-slate-50 p-8 rounded-[2rem] border border-white shadow-sm flex flex-col justify-between group hover:bg-white hover:border-blue-100 hover:shadow-xl transition-all">
              <div className="space-y-4">
                <div className="flex gap-1">{[1, 2, 3, 4, 5].map(j => <Star key={j} size={14} fill="#FFB800" className="text-[#FFB800]" />)}</div>
                <p className="text-slate-600 font-medium leading-relaxed italic">"{rev.text}"</p>
              </div>
              <div className="pt-6 flex items-center justify-between">
                <span className="font-black text-slate-900 uppercase text-xs">{rev.name}</span>
                <span className="text-[10px] font-bold text-slate-400">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PrintshoppyFooter settings={globalSettings || {}} />
    </div>
  );
};

export default StudioReviews;
