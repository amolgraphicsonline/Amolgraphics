import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface StudioFaqProps {
  showAllFaqs: boolean;
  setShowAllFaqs: (show: boolean) => void;
  openFaq: number | null;
  setOpenFaq: (idx: number | null) => void;
}

const StudioFaq: React.FC<StudioFaqProps> = ({ showAllFaqs, setShowAllFaqs, openFaq, setOpenFaq }) => {
  const faqs = [
    { q: "Can I write my own name?", a: "Yes! You can customize it with your name, message, or design." },
    { q: "Is it waterproof?", a: "Yes, our acrylic prints are resistant to water and can be cleaned with a damp cloth." },
    { q: "What is the thickness?", a: "Most of our products are 3MM or 5MM thick premium acrylic." },
    { q: "How do I install it?", a: "We provide hassle-free installation options including industrial-strength tape or sleek stand-offs." }
  ];

  return (
    <div className="max-w-[1240px] mx-auto mb-10 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2 italic">Common <span className="text-[#1877F2]">Questions</span></h2>
        <div className="w-10 h-1 bg-[#1877F2] mx-auto opacity-20 rounded-full"></div>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.slice(0, showAllFaqs ? undefined : 5).map((faq, i) => (
          <div key={i} className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-xs">
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left md:hover:bg-slate-50 transition-colors">
              <span className="font-bold text-slate-800 text-sm">{faq.q}</span>
              <ChevronLeft className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? '-rotate-90' : 'rotate-0'}`} />
            </button>
            {openFaq === i && <div className="px-5 pb-5 text-slate-500 text-xs leading-relaxed">{faq.a}</div>}
          </div>
        ))}
        <div className="pt-6 text-center">
          <button onClick={() => setShowAllFaqs(!showAllFaqs)} className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline">
            {showAllFaqs ? 'Show Less' : 'Show More +'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudioFaq;
