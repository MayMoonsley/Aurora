import { Schemas as S } from "../serialize/Schema.js";

export default class Ending {
    constructor(
        readonly title: string,
        readonly description: string,
    ) { }

    static schema = S.classOf({
        title: S.aString,
        description: S.aString,
    }, ({ title, description }) => new Ending(title, description));
}
