import React, { useState } from 'react';
import { useAIHelper } from '../hooks/useAIHelper';

const AIChatPanel = () => {
  const [message, setMessage] = useState('');
  const { messages, sendMessage, isLoading } = useAIHelper();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-royal-blue to-blue-600 text-white">
        <h2 className="text-lg font-bold flex items-center">
          <span className="mr-2">🤖</span>
          AI Physics Tutor
        </h2>
        <p className="text-sm text-blue-100">Powered by Groq + Tavily</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-6xl mb-4">🔬</div>
            <h3 className="font-semibold text-dark-gray mb-2">Welcome to VirtuLab AI!</h3>
            <p className="text-sm">Select an experiment and I'll explain the physics concepts in real-time!</p>
            <div className="mt-4 space-y-2 text-xs text-left bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-royal-blue font-semibold">Try asking:</p>
              <p>• "Why does the pendulum slow down?"</p>
              <p>• "How does Hooke's Law work?"</p>
              <p>• "What creates the focal point?"</p>
            </div>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-2xl shadow-sm ${
                msg.type === 'user'
                  ? 'bg-royal-blue text-white'
                  : 'bg-white text-dark-gray border border-gray-200'
              }`}
            >
              {msg.type === 'ai' && (
                <div className="flex items-center mb-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    msg.verified 
                      ? 'bg-emerald-green/10 text-emerald-green border border-emerald-green/20' 
                      : 'bg-bright-orange/10 text-bright-orange border border-bright-orange/20'
                  }`}>
                    {msg.verified ? '✅ Fact-Checked' : '⚡ Quick Answer'}
                  </span>
                </div>
              )}
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-royal-blue rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-royal-blue rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-royal-blue rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-gray-600">AI is analyzing physics...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about physics concepts..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="px-6 py-3 bg-gradient-to-r from-royal-blue to-blue-600 text-white rounded-xl hover:from-blue-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChatPanel;
