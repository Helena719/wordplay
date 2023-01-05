import Node, { type Replacement } from './Node';
import Doc from './Doc';
import type LanguageCode from '../translations/LanguageCode';
import type Translation from '../translations/Translation';

export default class Docs extends Node {
    readonly docs: Doc[];

    constructor(docs?: Doc[]) {
        super();

        this.docs =
            docs === undefined
                ? []
                : Array.isArray(docs)
                ? docs
                : Object.keys(docs).map(
                      (lang) => new Doc(docs[lang as LanguageCode], lang)
                  );

        this.computeChildren();
    }

    getGrammar() {
        return [{ name: 'docs', types: [[Doc]] }];
    }

    clone(replace?: Replacement) {
        return new Docs(
            this.replaceChild<Doc[]>('docs', this.docs, replace)
        ) as this;
    }

    computeConflicts() {
        return [];
    }

    getTranslation(lang: LanguageCode | LanguageCode[]): string {
        lang = Array.isArray(lang) ? lang : [lang];
        // Find the doc with the most preferred language, and if there are none, an emdash.
        return (
            (
                lang
                    .map((lang) =>
                        this.docs.find((doc) => doc.getLanguage() === lang)
                    )
                    .filter((doc): doc is Doc => doc !== undefined)[0] ??
                this.docs[0]
            )?.getText() ?? '—'
        );
    }

    getDescription(translation: Translation) {
        return translation.nodes.Docs.description;
    }
}
