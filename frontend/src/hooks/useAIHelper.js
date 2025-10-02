import { useState } from 'react';
import { useLab } from '../context/LabContext';

export const useAIHelper = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { experimentLogs } = useLab();

  const sendMessage = async (userMessage) => {
    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          experimentLogs: experimentLogs.slice(-5) // Send last 5 logs for context
        }),
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        type: 'ai',
        content: data.response,
        verified: data.verified || false
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        verified: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getInstantFeedback = async (action, data) => {
    try {
      const response = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, data }),
      });

      const feedback = await response.json();
      
      if (feedback.message) {
        setMessages(prev => [...prev, {
          type: 'ai',
          content: feedback.message,
          verified: feedback.verified || false
        }]);
      }
    } catch (error) {
      console.error('Failed to get AI feedback:', error);
    }
  };

  return {
    messages,
    sendMessage,
    getInstantFeedback,
    isLoading
  };
};
