import type Delete from '../nodes/Delete';
import type Select from '../nodes/Select';
import type Type from '../nodes/Type';
import type Update from '../nodes/Update';
import type Translation from '../translations/Translation';
import Conflict from './Conflict';

export default class NonBooleanQuery extends Conflict {
    readonly op: Select | Delete | Update;
    readonly type: Type;

    constructor(op: Select | Delete | Update, type: Type) {
        super(false);

        this.op = op;
        this.type = type;
    }

    getConflictingNodes() {
        return { primary: this.op.query, secondary: [] };
    }

    getPrimaryExplanation(translation: Translation) {
        return translation.conflict.NonBooleanQuery.primary();
    }

    getSecondaryExplanation() {
        return undefined;
    }
}
