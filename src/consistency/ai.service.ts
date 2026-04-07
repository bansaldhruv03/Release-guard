import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  async evaluateCommitMessage(commitMessage: string): Promise<{ isAcceptable: boolean, reason: string }> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.warn('No OPENAI_API_KEY set, skipping AI commit analysis.');
      return { isAcceptable: true, reason: 'AI Check skipped.' };
    }

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a strict DevOps quality gate. Your job is to analyze a git commit message. If the message is meaningless or extremely vague (like "fixed stuff", "wip", "update"), reject it. If it vaguely describes the work, accept it. Return ONLY a JSON object: { "isAcceptable": true/false, "reason": "short explanation" }'
          },
          { role: 'user', content: commitMessage }
        ],
        response_format: { type: "json_object" }
      }, {
        headers: { 'Authorization': "Bearer " }
      });

      const result = JSON.parse(response.data.choices[0].message.content);
      return { isAcceptable: !!result.isAcceptable, reason: result.reason };
    } catch (e: any) {
      this.logger.error('AI Evaluation failed', e.message);
      return { isAcceptable: true, reason: 'AI Check failed, defaulting to allow.' };
    }
  }
}
