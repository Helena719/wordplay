import Conflict from './Conflict';
import type Type from '../nodes/Type';
import type Is from '../nodes/Is';
import type Translation from '../translations/Translation';

export class IncompatibleType extends Conflict {
    readonly is: Is;
    readonly givenType: Type;

    constructor(is: Is, givenType: Type) {
        super(false);
        this.is = is;
        this.givenType = givenType;
    }

    getConflictingNodes() {
        return { primary: this.is.expression, secondary: [this.is.type] };
    }

    getPrimaryExplanation(translation: Translation) {
        return translation.conflict.IncompatibleType.primary(this.is.type);
    }

    getSecondaryExplanation(translation: Translation) {
        return translation.conflict.IncompatibleType.secondary();
    }
}
