"use strict";
// 'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers = require("./helpers");
module.exports = function (module) {
    function listPush(key, values, position = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            values = values.map(helpers.valueToString);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            yield module.client.collection('objects').updateOne({
                _key: key,
            }, {
                $push: {
                    array: Object.assign({ $each: values }, (position || {})),
                },
            }, {
                upsert: true,
            });
        });
    }
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    module.listPrepend = function (key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!key) {
                return;
            }
            const temp = Array.isArray(value) ? value : [value];
            temp.reverse();
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            const exists = yield module.isObjectField(key, 'array');
            if (exists) {
                yield listPush(key, temp, { $position: 0 });
            }
            else {
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                yield module.listAppend(key, temp);
            }
        });
    };
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    module.listAppend = function (key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!key) {
                return;
            }
            const temp = Array.isArray(value) ? value : [value];
            yield listPush(key, temp);
        });
    };
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    module.listRemoveLast = function (key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!key) {
                return;
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            const value = yield module.getListRange(key, -1, -1);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            module.client.collection('objects').updateOne({ _key: key }, { $pop: { array: 1 } });
            return (value && value.length) ? value[0] : null;
        });
    };
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    module.listRemoveAll = function (key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!key) {
                return;
            }
            const isArray = Array.isArray(value);
            if (isArray) {
                value = value.map(helpers.valueToString);
            }
            else {
                value = helpers.valueToString(value);
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            yield module.client.collection('objects').updateOne({
                _key: key,
            }, {
                $pull: { array: isArray ? { $in: value } : value },
            });
        });
    };
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    module.listTrim = function (key, start, stop) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!key) {
                return;
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            const value = yield module.getListRange(key, start, stop);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            yield module.client.collection('objects').updateOne({ _key: key }, { $set: { array: value } });
        });
    };
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    module.getListRange = function (key, start, stop) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!key) {
                return;
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            const data = yield module.client.collection('objects').findOne({ _key: key }, { array: 1 });
            if (!(data && data.array)) {
                return [];
            }
            return data.array.slice(start, stop !== -1 ? stop + 1 : undefined);
        });
    };
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    module.listLength = function (key) {
        return __awaiter(this, void 0, void 0, function* () {
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            const result = yield module.client.collection('objects').aggregate([
                { $match: { _key: key } },
                { $project: { count: { $size: '$array' } } },
            ]).toArray();
            return Array.isArray(result) && result.length && result[0].count;
        });
    };
};
