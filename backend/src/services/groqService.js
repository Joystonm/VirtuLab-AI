const axios = require('axios');

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.baseURL = 'https://api.groq.com/openai/v1';
  }

  async getResponse(message, experimentLogs = []) {
    // Demo mode if no API key
    if (!this.apiKey || this.apiKey === 'demo_key') {
      return this.getDemoResponse(message);
    }

    try {
      const context = this.buildContext(experimentLogs);
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: `You are an expert physics teacher for VirtuLab AI. Act like a real teacher - be encouraging, ask follow-up questions, and provide clear explanations with real-world analogies. Help students understand mechanics, oscillations, optics, and Newton's laws through interactive dialogue. Always relate concepts to everyday experiences. Context: ${context}`
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 600,
          temperature: 0.8
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
      return this.getDemoResponse(message);
    }
  }

  getDemoResponse(message) {
    const teacherResponses = {
      'pendulum': '🎯 Great observation! A pendulum is like a swing at the playground. The time it takes to complete one swing (the period) depends only on the length of the string, not how heavy the bob is. Isn\'t that fascinating? What do you think would happen if we made the string longer?',
      
      'spring': '🌀 Excellent question about springs! Think of a spring like a rubber band - the more you stretch it, the harder it pulls back. This is Hooke\'s Law: F = -kx. The spring constant \'k\' tells us how stiff the spring is. Have you ever noticed this when stretching a rubber band?',
      
      'incline': '📦 Perfect! On an inclined plane, gravity acts like it\'s pulling the block in two directions - straight down and along the slope. The steeper the slope, the faster the block slides. Friction acts like invisible hands trying to slow it down. What angle do you think would make the block slide fastest?',
      
      'newton': '📐 Brilliant! Newton\'s Second Law (F = ma) is everywhere around us. When you push a shopping cart, the harder you push (more force), the faster it accelerates. A heavy cart needs more force than a light one for the same acceleration. Can you think of other examples from daily life?',
      
      'lens': '🔍 Wonderful observation! A convex lens works just like the lens in your eye or a magnifying glass. It bends light rays to meet at a focal point, creating clear images. The distance from the lens to this focal point is called the focal length. Have you ever used a magnifying glass to focus sunlight?',
      
      'mirror': '🪞 Excellent! A concave mirror is like the inside of a spoon - it curves inward and can focus light to a point. This is why satellite dishes and car headlights use this shape. The focal point is where all the light rays meet. What do you see when you look at your reflection in a spoon?',
      
      'why': 'That\'s a fantastic question! The \'why\' behind physics is what makes it so exciting. Physics explains the patterns we see in nature - from why planets orbit the sun to why your phone screen responds to touch. What specific aspect would you like me to explain further?',
      
      'how': 'Great question! Understanding \'how\' things work is the key to mastering physics. Let me break this down step by step with a real-world analogy that will make it crystal clear. What part would you like me to focus on first?',
      
      'default': '🤖 Hello! I\'m your physics teacher here at VirtuLab AI. I love helping students discover the amazing world of physics through hands-on experiments. Think of me as your friendly guide who\'s here to answer questions, explain concepts, and help you see physics in everyday life. What experiment caught your attention today?'
    };

    // Find the best matching response
    const key = Object.keys(teacherResponses).find(k => 
      message.toLowerCase().includes(k)
    ) || 'default';
    
    return {
      answer: teacherResponses[key],
      needsVerification: this.shouldVerify(message)
    };
  }

  async getInstantFeedback(action, data) {
    const teacherFeedback = {
      'pendulum_explanation': {
        message: '🎯 Notice how the pendulum swings back and forth with perfect rhythm! This is called simple harmonic motion. The amazing thing is that the time for each swing stays the same, even as the pendulum slows down due to air resistance. What do you think controls this timing?',
        type: 'success'
      },
      'spring_explanation': {
        message: '🌀 Watch carefully as the spring compresses and extends! The spring is storing and releasing energy, just like a trampoline. When compressed, it has potential energy. When released, this becomes kinetic energy. Can you see the energy transformation happening?',
        type: 'success'
      },
      'incline_explanation': {
        message: '📦 Perfect! See how the block accelerates down the slope? Gravity is pulling it down, but friction is fighting back. The steeper the angle, the stronger gravity\'s pull along the slope. This is why ski slopes work - and why your bike rolls downhill!',
        type: 'success'
      },
      'newton_explanation': {
        message: '📐 Excellent demonstration of F = ma! Notice how when we apply more force, the acceleration increases proportionally. This is Newton\'s Second Law in action - the same principle that launches rockets and helps you ride a bicycle. Isn\'t physics everywhere?',
        type: 'success'
      },
      'lens_explanation': {
        message: '🔍 Beautiful! Watch how the light rays bend as they pass through the lens. This bending (refraction) happens because light slows down in glass. The curved shape focuses all rays to one point - that\'s how your eyes work to create clear vision!',
        type: 'success'
      },
      'mirror_explanation': {
        message: '🪞 Fantastic! See how the curved mirror reflects light rays to a focal point? This is the same principle used in telescopes to gather starlight and in car headlights to create bright beams. The curve shape is the key to focusing!',
        type: 'success'
      }
    };

    return teacherFeedback[action] || {
      message: 'Keep exploring! Physics is full of wonderful surprises. What questions do you have about what you\'re observing?',
      type: 'info'
    };
  }

  buildContext(experimentLogs) {
    if (!experimentLogs.length) return 'Student is beginning their physics exploration.';
    
    const recent = experimentLogs.slice(-3);
    return `Recent student activities: ${recent.map(log => `${log.action} - ${log.timestamp}`).join(', ')}`;
  }

  shouldVerify(message) {
    const verificationKeywords = ['why', 'how', 'explain', 'what happens', 'theory', 'principle', 'law', 'formula', 'prove', 'evidence'];
    return verificationKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }
}

module.exports = new GroqService();
