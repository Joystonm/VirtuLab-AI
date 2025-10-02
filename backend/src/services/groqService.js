const axios = require('axios');

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.baseURL = 'https://api.groq.com/openai/v1';
  }

  async getResponse(message, experimentLogs = []) {
    try {
      const context = this.buildContext(experimentLogs);
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: `You are an AI science tutor for VirtuLab AI. Help students understand physics and chemistry experiments. Be encouraging, clear, and educational. Context: ${context}`
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const answer = response.data.choices[0].message.content;
      
      return {
        answer,
        needsVerification: this.shouldVerify(message)
      };
    } catch (error) {
      console.error('Groq API Error:', error.response?.data || error.message);
      return {
        answer: "I'm having trouble right now. Please try asking again!",
        needsVerification: false
      };
    }
  }

  async getInstantFeedback(action, data) {
    const feedbackMap = {
      'short_circuit': {
        message: '⚡ Warning: Short circuit detected! This could damage components. Try adding more wires to complete the circuit properly.',
        type: 'warning'
      },
      'circuit_complete': {
        message: '✅ Great! Your circuit is complete and the bulb should light up. Well done!',
        type: 'success'
      },
      'chemical_reaction': {
        message: '🧪 Chemical reaction in progress! Watch the color change as acids and bases neutralize.',
        type: 'success'
      }
    };

    return feedbackMap[action] || {
      message: 'Keep experimenting! I\'m here to help if you have questions.',
      type: 'info'
    };
  }

  buildContext(experimentLogs) {
    if (!experimentLogs.length) return 'Student just started experimenting.';
    
    const recent = experimentLogs.slice(-3);
    return `Recent actions: ${recent.map(log => `${log.action} at ${log.timestamp}`).join(', ')}`;
  }

  shouldVerify(message) {
    const verificationKeywords = ['why', 'how', 'explain', 'what happens', 'theory', 'principle'];
    return verificationKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }
}

module.exports = new GroqService();
