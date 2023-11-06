"use strict";
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
exports.handler = void 0;
const S3Actions_1 = require("../helpers/S3Actions");
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("event:", event);
    // assuming start and end dates will have YYYY-MM-DD format
    const start = event.startDate.split("-");
    const end = event.endDate.split("-");
    let year = parseInt(start[0]);
    let month = parseInt(start[1]);
    let contents = [];
    do {
        try {
            const prefix = `${event.companyId}/history/${year}-${month}-`;
            const objects = yield (0, S3Actions_1.fetchAggregatedDataForCompany)(prefix);
            if (objects.Contents.length > 0) {
                contents = contents.concat(objects.Contents);
            }
        }
        catch (e) {
            console.log("Error fetching S3 files:", e.message);
            throw new Error(e);
        }
        month++;
        if (month > 12) {
            month = 1;
            year++;
        }
    } while (year < parseInt(end[0]) || (year <= parseInt(end[0]) && month <= parseInt(end[1])));
    let result = [];
    contents.map((c) => {
        result.push(c.Key);
    });
    return result;
});
exports.handler = handler;
