import { LANGUAGE_SYMBOL } from '../parser/Symbols';
import Token from './Token';
import TokenType from './TokenType';

export default class LanguageToken extends Token {
    constructor() {
        super(LANGUAGE_SYMBOL, TokenType.LANGUAGE);
    }
}
