import axios from 'axios';
import { TokenList, TokenListMap } from '@/types/TokenList';

export default class TokenListService {
  public async getTokenListMap(url: string): Promise<TokenListMap> {
    const { data } = await axios.get<{ result: TokenList }>(url);

    return { [url]: data.result };
  }
}

export const tokenListService = new TokenListService();
