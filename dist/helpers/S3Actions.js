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
exports.fetchAggregatedDataForCompany = exports.writeAggregatedDatatoS3 = void 0;
const AWS = require("aws-sdk");
AWS.config.update({
    region: process.env.REGION
});
const s3 = new AWS.S3();
const bucketName = process.env.BUCKET_NAME;
function writeAggregatedDatatoS3(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentDate = data.createdAt;
        const formatDate = currentDate.toISOString().split('T')[0];
        const s3Key = `${data.companyId}/history/${formatDate}.json`;
        const params = {
            Bucket: bucketName,
            Key: s3Key,
            Body: JSON.stringify(data),
            ContentType: 'application/json',
        };
        return s3.upload(params).promise().then(data => { console.log(`S3 status for ${s3Key}:`, data); });
    });
}
exports.writeAggregatedDatatoS3 = writeAggregatedDatatoS3;
function fetchAggregatedDataForCompany(prefix) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = {
            Bucket: bucketName,
            Prefix: prefix
        };
        return s3.listObjectsV2(params).promise();
    });
}
exports.fetchAggregatedDataForCompany = fetchAggregatedDataForCompany;
