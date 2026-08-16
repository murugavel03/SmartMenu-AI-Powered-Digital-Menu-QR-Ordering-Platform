import type { MenuParserProvider } from './providers/base';
import { MockMenuParser } from './providers/mock';
import { OpenAIMenuParser } from './providers/openai';

export function getMenuParser(): MenuParserProvider {
  const provider = process.env.AI_PROVIDER || 'mock';

  switch (provider) {
    case 'openai': {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error('OPENAI_API_KEY not set');
      return new OpenAIMenuParser(apiKey);
    }
    case 'mock':
    default:
      return new MockMenuParser();
  }
}

export type { MenuParserProvider };
