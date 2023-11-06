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
exports.getVulnerabilitiesForPackage = exports.getUserCountForCompany = exports.getCompanies = void 0;
const AWS = require("aws-sdk");
const dbClient = new AWS.DynamoDB.DocumentClient();
const companyTable = process.env.COMPANY_TABLE_NAME;
const userTable = process.env.USER_TABLE_NAME;
const vulnerabilityTable = process.env.VULNERABILITY_TABLE_NAME;
function getCompanies() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const params = {
                TableName: companyTable
            };
            let companies = [];
            let lastEvaluatedKey = null;
            do {
                if (lastEvaluatedKey) {
                    params.ExclusiveStartKey = lastEvaluatedKey;
                }
                const result = yield dbClient.scan(params).promise();
                const fetchedCompanies = result.Items;
                companies = companies.concat(fetchedCompanies);
                lastEvaluatedKey = result.LastEvaluatedKey;
            } while (lastEvaluatedKey);
            return companies;
        }
        catch (e) {
            console.log("Error:", e.message);
            throw new Error(e);
        }
    });
}
exports.getCompanies = getCompanies;
function getUserCountForCompany(companyId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const params = {
                TableName: userTable,
                FilterExpression: "companyId = :companyId",
                ExpressionAttributeValues: {
                    ':companyId': companyId,
                },
                Select: 'COUNT',
                ExclusiveStartKey: null
            };
            const result = yield dbClient.scan(params).promise();
            return result.Count || 0;
        }
        catch (e) {
            console.log("Error:", e.message);
            throw new Error(e);
        }
    });
}
exports.getUserCountForCompany = getUserCountForCompany;
function getVulnerabilitiesForPackage(packageName, packageVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = {
            TableName: vulnerabilityTable,
            IndexName: 'PackageNameVersionIndex',
            KeyConditionExpression: 'packageName = :packageName AND packageVersion = :packageVersion',
            ExpressionAttributeValues: {
                ':packageName': packageName,
                ':packageVersion': packageVersion,
            },
        };
        try {
            const result = yield dbClient.query(params).promise();
            const fetchedVulnerabilities = result.Items;
            return fetchedVulnerabilities || [];
        }
        catch (e) {
            console.log("Error:", e.message);
            throw new Error(e);
        }
    });
}
exports.getVulnerabilitiesForPackage = getVulnerabilitiesForPackage;
