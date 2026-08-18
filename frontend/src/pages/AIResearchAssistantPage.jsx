import React, { useState } from 'react';
import api from '../services/api';
import { Bot, Send, Sparkles, User, RefreshCw } from 'lucide-react';

const AIResearchAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am your **AI Research & Innovation Assistant**. Ask me about active grant opportunities, research papers in OpenAlex, USPTO patent records, or commercialization scores."
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage;
    setInputMessage('');

    const updatedMessages = [...messages, { role: 'user', content: userText }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await api.post('/assistant/chat', {
        message: userText,
        conversation_history: updatedMessages
      });

      setMessages([...updatedMessages, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages([...updatedMessages, { role: 'assistant', content: "Sorry, I encountered an error querying the platform database." }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetQuestion = (q) => {
    setInputMessage(q);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-3xl border border-[#e2ded4] shadow-sm overflow-hidden">
      {/* Assistant Header */}
      <div className="p-4 border-b border-[#e2ded4] bg-[#f8f6f0] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#24527a] text-white shadow-md shadow-[#24527a]/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#1a2530] flex items-center gap-2">
              Platform AI Research Assistant
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[11px] text-[#576574] font-semibold">Connected live to OpenAlex, USPTO Patents, & Federal Grants</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#fbf9f4]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-[#24527a] text-white' : 'bg-white text-[#24527a] border border-[#e2ded4] shadow-sm'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[#24527a] text-white rounded-tr-none font-semibold'
                : 'bg-white border border-[#e2ded4] text-[#1a2530] rounded-tl-none space-y-2 shadow-sm font-medium'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-[#576574] text-xs p-2 font-semibold">
            <Bot className="w-4 h-4 animate-bounce text-[#24527a]" />
            <span>Analyzing database records...</span>
          </div>
        )}
      </div>

      {/* Recommended Preset Questions */}
      <div className="px-6 py-2 border-t border-[#e2ded4] bg-[#f8f6f0] flex items-center gap-2 overflow-x-auto text-[11px] text-[#576574]">
        <span className="font-bold shrink-0">Try asking:</span>
        <button onClick={() => handlePresetQuestion("What funding opportunities exist for computer vision in medical imaging?")} className="px-2.5 py-1 bg-white hover:bg-[#f0ece2] rounded-lg border border-[#e2ded4] shrink-0 font-semibold text-[#1a2530]">
          "Grants for computer vision?"
        </button>
        <button onClick={() => handlePresetQuestion("Are there patents related to AI medical imaging?")} className="px-2.5 py-1 bg-white hover:bg-[#f0ece2] rounded-lg border border-[#e2ded4] shrink-0 font-semibold text-[#1a2530]">
          "Patents in medical AI?"
        </button>
        <button onClick={() => handlePresetQuestion("What are the trending clean tech energy storage grants?")} className="px-2.5 py-1 bg-white hover:bg-[#f0ece2] rounded-lg border border-[#e2ded4] shrink-0 font-semibold text-[#1a2530]">
          "Clean tech grant trends?"
        </button>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-[#e2ded4] bg-white flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a question about research papers, grants, patents, or innovation scores..."
          className="flex-1 bg-white border border-[#dcd6c8] rounded-2xl px-4 py-3 text-xs text-[#1a2530] font-semibold focus:outline-none focus:border-[#24527a]"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="px-5 py-3 bg-[#24527a] hover:bg-[#1b3d5c] text-white rounded-2xl text-xs font-bold shadow-md shadow-[#24527a]/20 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AIResearchAssistantPage;
