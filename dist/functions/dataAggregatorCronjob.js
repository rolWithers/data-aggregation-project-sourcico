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
const dynamoDbActions_1 = require("../helpers/dynamoDbActions");
const S3Actions_1 = require("../helpers/S3Actions");
const models_1 = require("../models/models");
const handler = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Data aggregation start for date ${new Date}`);
    const topPackNumber = 3;
    let companies = [];
    try {
        companies = yield (0, dynamoDbActions_1.getCompanies)();
    }
    catch (e) {
        console.log("Error fetching companies:", e.message);
        throw new Error(e);
    }
    yield Promise.all(companies.map((c) => __awaiter(void 0, void 0, void 0, function* () {
        const companyName = c.companyName;
        const packages = Object.entries(c.packages);
        let vulnerabilities = [];
        const [userCount,] = yield Promise.all([
            (0, dynamoDbActions_1.getUserCountForCompany)(c.companyId),
            ...packages.map(([packageName, packageVersion]) => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, dynamoDbActions_1.getVulnerabilitiesForPackage)(packageName, packageVersion);
                vulnerabilities = [...vulnerabilities, ...res];
            })),
        ]);
        let uniquePackages = [];
        const severities = {
            [models_1.VulnerabilityTypes.Low]: 0,
            [models_1.VulnerabilityTypes.Medium]: 0,
            [models_1.VulnerabilityTypes.High]: 0,
            [models_1.VulnerabilityTypes.Critical]: 0
        };
        vulnerabilities.map((v) => {
            severities[v.severity]++;
            let exist = false;
            for (const i of uniquePackages) {
                if (i.packageName === v.packageName) {
                    exist = true;
                    break;
                }
            }
            !exist ? uniquePackages.push({ packageName: v.packageName, topVulnerabilityCounter: 0 }) : null;
            if (v.severity === models_1.VulnerabilityTypes.High || v.severity === models_1.VulnerabilityTypes.Critical) {
                const pck = uniquePackages.find(p => p.packageName === v.packageName);
                if (pck) {
                    pck.topVulnerabilityCounter++;
                }
            }
        });
        const sortedPackages = uniquePackages.sort((a, b) => a.topVulnerabilityCounter - b.topVulnerabilityCounter);
        const topThreePackages = sortedPackages.slice(0, topPackNumber);
        const finalAggregatedData = {
            companyId: c.companyId,
            createdAt: new Date,
            companyName,
            numberUsers: userCount || 0,
            vulnerablePackNumber: uniquePackages.length,
            vulnerableTopThree: topThreePackages,
            severitiesCounter: [
                { severity: models_1.VulnerabilityTypes.Low, count: severities[models_1.VulnerabilityTypes.Low] },
                { severity: models_1.VulnerabilityTypes.Medium, count: severities[models_1.VulnerabilityTypes.Medium] },
                { severity: models_1.VulnerabilityTypes.High, count: severities[models_1.VulnerabilityTypes.High] },
                { severity: models_1.VulnerabilityTypes.Critical, count: severities[models_1.VulnerabilityTypes.Critical] }
            ]
        };
        console.log("final aggro data:", finalAggregatedData);
        yield (0, S3Actions_1.writeAggregatedDatatoS3)(finalAggregatedData);
    })));
    console.log(`Finished aggregation data cronjob for date ${new Date().toISOString().split('T')[0]}`);
    return null;
});
exports.handler = handler;
