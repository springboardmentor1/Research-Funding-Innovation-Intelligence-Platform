import React from 'react';
import { FaLightbulb } from 'react-icons/fa';

export default function InnovationPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto flex flex-col items-center justify-center h-full text-center py-20">
      <div className="w-24 h-24 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mb-6">
        <FaLightbulb size={40} />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">Innovation Scoring</h2>
      <p className="text-slate-400 max-w-lg mb-8">
        Evaluate commercialization potential, track market opportunities, and score innovative ideas using our proprietary AI models.
      </p>
      <div className="bg-[#1c2438] border border-slate-800 rounded-2xl p-6 w-full max-w-3xl text-left">
        <h3 className="text-white font-bold mb-4">Top Innovation Opportunities</h3>
        <div className="space-y-4">
          {[
            { name: 'Non-invasive Glucose Monitoring', score: 94 },
            { name: 'Solid State Battery Tech', score: 89 },
            { name: 'Carbon Capture Materials', score: 82 }
          ].map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-200">{item.name}</span>
                <span className="text-amber-400 font-bold">{item.score}% Commercialization Score</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${item.score}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
