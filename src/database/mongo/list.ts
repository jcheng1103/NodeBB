// 'use strict';

import helpers = require('./helpers');

module.exports = function (module) {
    async function listPush(key : unknown, values : unknown[],
        position : {$position : number} | undefined = undefined) {
        values = values.map(helpers.valueToString);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await module.client.collection('objects').updateOne({
            _key: key,
        }, {
            $push: {
                array: {
                    $each: values,
                    ...(position || {}),
                },
            },
        }, {
            upsert: true,
        });
    }

    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    module.listPrepend = async function (key : unknown, value : unknown) {
        if (!key) {
            return;
        }
        const temp : unknown[] = Array.isArray(value) ? value : [value];
        temp.reverse();
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const exists : boolean = await module.isObjectField(key, 'array') as boolean;
        if (exists) {
            await listPush(key, temp, { $position: 0 });
        } else {
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await module.listAppend(key, temp);
        }
    };

    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    module.listAppend = async function (key : unknown, value : unknown) {
        if (!key) {
            return;
        }
        const temp : unknown[] = Array.isArray(value) ? value : [value];
        await listPush(key, temp);
    };

    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    module.listRemoveLast = async function (key : unknown) {
        if (!key) {
            return;
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const value : unknown[] = await module.getListRange(key, -1, -1) as unknown[];
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        module.client.collection('objects').updateOne({ _key: key }, { $pop: { array: 1 } });
        return (value && value.length) ? value[0] : null;
    };

    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    module.listRemoveAll = async function (key : unknown, value : unknown[]) {
        if (!key) {
            return;
        }
        const isArray = Array.isArray(value);
        if (isArray) {
            value = value.map(helpers.valueToString);
        } else {
            value = helpers.valueToString(value);
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await module.client.collection('objects').updateOne({
            _key: key,
        }, {
            $pull: { array: isArray ? { $in: value } : value },
        });
    };

    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    module.listTrim = async function (key : unknown, start : number, stop : number) {
        if (!key) {
            return;
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const value : unknown[] = await module.getListRange(key, start, stop) as unknown[];
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await module.client.collection('objects').updateOne({ _key: key }, { $set: { array: value } });
    };

    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    module.getListRange = async function (key : unknown, start : number, stop : number) : Promise<unknown[]> {
        if (!key) {
            return;
        }

        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const data : {array: unknown[]} = await module.client.collection('objects').findOne({ _key: key }, { array: 1 }) as {array: unknown[]};
        if (!(data && data.array)) {
            return [];
        }

        return data.array.slice(start, stop !== -1 ? stop + 1 : undefined);
    };

    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    module.listLength = async function (key : unknown) : Promise<number> {
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const result : {count : number}[] = await module.client.collection('objects').aggregate([
            { $match: { _key: key } },
            { $project: { count: { $size: '$array' } } },
        ]).toArray() as {count : number}[];
        return Array.isArray(result) && result.length && result[0].count;
    };
};
