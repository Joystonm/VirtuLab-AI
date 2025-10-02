const axios = require('axios');

class TavilyService {
  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY;
    this.baseURL = 'https://api.tavily.com';
  }

  async searchAndVerify(query) {
    try {
      const response = await axios.post(
        `${this.baseURL}/search`,
        {
          api_key: this.apiKey,
          query: `${query} physics chemistry science education`,
          search_depth: 'basic',
          include_answer: true,
          include_domains: ['khanacademy.org', 'britannica.com', 'physics.org', 'chemistry.org'],
          max_results: 3
        }
      );

      return {
        answer: response.data.answer,
        sources: response.data.results.map(result => ({
          title: result.title,
          url: result.url,
          snippet: result.content
        }))
      };
    } catch (error) {
      console.error('Tavily API Error:', error.response?.data || error.message);
      return null;
    }
  }

  async factCheck(statement) {
    try {
      const response = await this.searchAndVerify(`fact check: ${statement}`);
      return response?.answer || null;
    } catch (error) {
      console.error('Fact check error:', error);
      return null;
    }
  }
}

module.exports = new TavilyService();
