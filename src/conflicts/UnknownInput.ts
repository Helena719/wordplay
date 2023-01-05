import type Evaluate from '../nodes/Evaluate';
import Conflict from './Conflict';
import type Bind from '../nodes/Bind';
import type StructureDefinition from '../nodes/StructureDefinition';
import type FunctionDefinition from '../nodes/FunctionDefinition';
import type Translation from '../translations/Translation';

export default class UnknownInput extends Conflict {
    readonly func: FunctionDefinition | StructureDefinition;
    readonly evaluate: Evaluate;
    readonly given: Bind;

    constructor(
        func: FunctionDefinition | StructureDefinition,
        evaluate: Evaluate,
        given: Bind
    ) {
        super(false);

        this.func = func;
        this.evaluate = evaluate;
        this.given = given;
    }

    getConflictingNodes() {
        return { primary: this.given.names, secondary: [] };
    }

    getPrimaryExplanation(translation: Translation) {
        return translation.conflict.UnknownInput.primary();
    }

    getSecondaryExplanation() {
        return undefined;
    }
}
