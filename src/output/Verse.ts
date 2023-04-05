import Structure from '@runtime/Structure';
import type Value from '@runtime/Value';
import TypeOutput, { TypeOutputInputs } from './TypeOutput';
import type RenderContext from './RenderContext';
import Phrase from './Phrase';
import Color from './Color';
import Place from './Place';
import toStructure from '../native/toStructure';
import Measurement from '@runtime/Measurement';
import Decimal from 'decimal.js';
import { toColor } from './Color';
import List from '@runtime/List';
import type LanguageCode from '@translation/LanguageCode';
import { getPreferredTranslation } from '@translation/getPreferredTranslation';
import { getBind } from '@translation/getBind';
import Bool from '../runtime/Bool';
import { getStyle, toTypeOutput, toTypeOutputList } from './toTypeOutput';
import type TextLang from './TextLang';
import Pose from './Pose';
import type Sequence from './Sequence';
import Group from './Group';

export const DefaultFont = 'Noto Sans';
export const DefaultSize = 1;

export const VerseType = toStructure(`
    ${getBind((t) => t.output.verse.definition, '•')} Type(
        ${getBind((t) => t.output.verse.content)}•[Type]
        ${getBind((t) => t.output.verse.background)}•Color: Color(100 0 0°)
        ${TypeOutputInputs}
    )
`);

export default class Verse extends TypeOutput {
    readonly content: (TypeOutput | null)[];
    readonly background: Color;

    constructor(
        value: Value,
        content: (TypeOutput | null)[],
        background: Color,
        size: number,
        font: string,
        place: Place | undefined = undefined,
        rotation: number | undefined = undefined,
        name: TextLang | string,
        selectable: boolean,
        entry: Pose | Sequence | undefined = undefined,
        rest: Pose | Sequence,
        move: Pose | Sequence | undefined = undefined,
        exit: Pose | Sequence | undefined = undefined,
        duration: number = 0,
        style: string | undefined = 'zippy'
    ) {
        super(
            value,
            size,
            font,
            place,
            rotation,
            name,
            selectable,
            entry,
            rest,
            move,
            exit,
            duration,
            style
        );

        this.content = content;
        this.background = background;
    }

    getOutput() {
        return this.content;
    }

    getLayout(context: RenderContext) {
        const places: [TypeOutput, Place][] = [];
        let left = 0,
            right = 0,
            bottom = 0,
            top = 0;
        for (const child of this.content) {
            if (child) {
                const layout = child.getLayout(context);
                const place =
                    child instanceof Phrase && child.place
                        ? child.place
                        : new Place(
                              this.value,
                              // Place everything in the center
                              -layout.width / 2,
                              // We would normally not t negate the y because its in math coordinates, but we want to move it
                              // down the y-axis by half, so we subtract.
                              -layout.height / 2,
                              0
                          );
                places.push([child, place]);

                if (place.x < left) left = place.x;
                if (place.x + layout.width > right)
                    right = place.x + layout.width;
                if (place.y < bottom) bottom = place.y;
                if (place.y + layout.height > top)
                    top = place.y + layout.height;
            }
        }

        return {
            output: this,
            left,
            right,
            top,
            bottom,
            width: right - left,
            height: top - bottom,
            places,
        };
    }

    getBackground(): Color | undefined {
        return undefined;
    }

    getDescription(languages: LanguageCode[]) {
        return getPreferredTranslation(languages).output.verse.description(
            this.content.length,
            this.content.filter((o) => o instanceof Phrase).length,
            this.content.filter((o) => o instanceof Group).length
        );
    }

    isEmpty() {
        return this.content.every((c) => c === null || c.isEmpty());
    }
}

export class NameGenerator {
    /** Number visible phrases, giving them unique IDs to key off of. */
    readonly counter = new Map<number, number>();

    constructor() {}

    getName(value: Value) {
        const nodeID = value.creator.id;
        const count = (this.counter.get(nodeID) ?? 0) + 1;
        this.counter.set(nodeID, count);
        return `${nodeID}-${count}`;
    }
}

export function toVerse(value: Value): Verse | undefined {
    if (!(value instanceof Structure)) return undefined;

    // Create a name generator to guarantee unique default names for all TypeOutput.
    const namer = new NameGenerator();

    if (value.type === VerseType) {
        const possibleGroups = value.resolve('content');
        const content =
            possibleGroups instanceof List
                ? toTypeOutputList(possibleGroups, namer)
                : toTypeOutput(possibleGroups, namer);
        const background = toColor(value.resolve('background'));

        const {
            size,
            font,
            place,
            rotation,
            name,
            selectable,
            rest,
            enter,
            move,
            exit,
            duration,
            style,
        } = getStyle(value);

        return content !== undefined &&
            background !== undefined &&
            duration !== undefined &&
            style !== undefined
            ? new Verse(
                  value,
                  Array.isArray(content) ? content : [content],
                  background,
                  size ?? DefaultSize,
                  font ?? DefaultFont,
                  place,
                  rotation,
                  name ?? namer.getName(value),
                  selectable,
                  enter,
                  rest ?? new Pose(value),
                  move,
                  exit,
                  duration,
                  style
              )
            : undefined;
    }
    // Try converting it to a group and wrapping it in a Verse.
    else {
        const type = toTypeOutput(value, namer);
        return type === undefined
            ? undefined
            : new Verse(
                  value,
                  [type],
                  new Color(
                      value,
                      new Decimal(100),
                      new Decimal(0),
                      new Decimal(0)
                  ),
                  DefaultSize,
                  DefaultFont,
                  undefined,
                  0,
                  namer.getName(value),
                  type.selectable,
                  undefined,
                  new Pose(value),
                  undefined,
                  undefined,
                  0,
                  'zippy'
              );
    }
}

export function toDecimal(value: Value | undefined): Decimal | undefined {
    return value instanceof Measurement ? value.num : undefined;
}

export function toBoolean(value: Value | undefined): boolean | undefined {
    return value instanceof Bool ? value.bool : undefined;
}
