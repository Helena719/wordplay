import toStructure from '../native/toStructure';
import { TYPE_SYMBOL } from '@parser/Symbols';
import type Value from '@runtime/Value';
import { getBind } from '@translation/getBind';
import Output from './Output';
import type RenderContext from './RenderContext';
import type Place from './Place';
import type TypeOutput from './TypeOutput';
import type LanguageCode from '@translation/LanguageCode';

export const ArrangementType = toStructure(`
    ${getBind((t) => t.output.layout.definition, TYPE_SYMBOL)}()
`);

export default abstract class Layout extends Output {
    constructor(value: Value) {
        super(value);
    }

    /** Compute positions for all subgroups in the group. */
    abstract getLayout(
        output: (TypeOutput | null)[],
        context: RenderContext
    ): {
        left: number;
        top: number;
        right: number;
        bottom: number;
        width: number;
        height: number;
        places: [TypeOutput, Place][];
    };

    abstract getDescription(
        output: (TypeOutput | null)[],
        languages: LanguageCode[]
    ): string;
}
