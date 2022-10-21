import MissingLanguage from "../conflicts/MissingLanguage";
import type Context from "./Context";
import Node from "./Node";
import Token from "./Token";
import { getPossibleLanguages } from "../transforms/getPossibleLanguages";
import type Transform from "../transforms/Transform";
import Replace from "../transforms/Replace";
import Add from "../transforms/Add";
import LanguageToken from "./LanguageToken";
import NameToken from "./NameToken";

export default class Language extends Node {
    
    readonly slash: Token;
    readonly lang?: Token;

    constructor(lang?: Token | string, slash?: Token) {
        super();

        this.slash = slash ?? new LanguageToken();
        this.lang = typeof lang === "string" ? new NameToken(lang) : lang;
    }

    clone(pretty: boolean=false, original?: Node | string, replacement?: Node) { 
        return new Language(
            this.cloneOrReplaceChild(pretty, [ Token, undefined ], "lang", this.lang, original, replacement), 
            this.cloneOrReplaceChild(pretty, [ Token ], "slash", this.slash, original, replacement)
        ) as this; 
    }

    computeChildren() {  return this.lang === undefined ? [ this.slash ] : [ this.slash, this.lang ]; }

    computeConflicts() {
        if(this.lang === undefined)
            return [ new MissingLanguage(this) ];
        
        return [];
    }

    getLanguage() { return this.lang instanceof Token ? this.lang.text.toString() : undefined; }

    equals(lang: Language) {
        return this.getLanguage() === lang.getLanguage();
    }

    getDescriptions() {
        return {
            eng: "a language"
        }
    }

    getReplacementChild(child: Node, context: Context): Transform[] | undefined { 

        const project = context.source.getProject();
        if(child === this.lang && project !== undefined)
            return getPossibleLanguages(project).map(l => new Replace(context.source, this.lang as Token, new NameToken(l)))

    }

    getInsertionBefore() { return undefined; }

    getInsertionAfter(context: Context, position: number) { 

        const project = context.source.getProject();
        if(this.lang === undefined && project !== undefined)
            return getPossibleLanguages(project).map(l => new Add(context.source, position, this, "lang", new NameToken(l)));

     }
}