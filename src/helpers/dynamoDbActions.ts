
import * as AWS from 'aws-sdk';
const dbClient = new AWS.DynamoDB.DocumentClient();
import { CompanyModel, UserModel, VulnerabilityModel } from "../models/models";

const companyTable: string = process.env.COMPANY_TABLE_NAME;
const userTable: string = process.env.USER_TABLE_NAME;
const vulnerabilityTable: string = process.env.VULNERABILITY_TABLE_NAME;

export async function getCompanies(): Promise<CompanyModel[]> {
    try {
        const params: AWS.DynamoDB.DocumentClient.QueryInput = {
            TableName: companyTable
        };
        let companies: CompanyModel[] = [];
        let lastEvaluatedKey = null;

        do {
            if (lastEvaluatedKey) {
                params.ExclusiveStartKey = lastEvaluatedKey;
            }
            const result = await dbClient.scan(params).promise();
            const fetchedCompanies = result.Items as CompanyModel[];
            companies = companies.concat(fetchedCompanies);
            lastEvaluatedKey = result.LastEvaluatedKey;
        } while (lastEvaluatedKey);

        return companies;
    } catch (e: any) {
        console.log("Error:", e.message);
        throw new Error(e);
    }
}

export async function getUserCountForCompany(companyId: string): Promise<number> {
    try {
        const params: AWS.DynamoDB.DocumentClient.QueryInput = {
            TableName: userTable,
            FilterExpression: "companyId = :companyId",
            ExpressionAttributeValues: {
                ':companyId': companyId,
            },
            Select: 'COUNT',
            ExclusiveStartKey: null
        };
        const result = await dbClient.scan(params).promise();
        return result.Count || 0;
    } catch (e: any) {
        console.log("Error:", e.message);
        throw new Error(e);
    }
}

export async function getVulnerabilitiesForPackage(packageName: string, packageVersion: string): Promise<VulnerabilityModel[]> {
    const params: AWS.DynamoDB.DocumentClient.QueryInput = {
        TableName: vulnerabilityTable,
        IndexName: 'PackageNameVersionIndex',
        KeyConditionExpression: 'packageName = :packageName AND packageVersion = :packageVersion',
        ExpressionAttributeValues: {
            ':packageName': packageName,
            ':packageVersion': packageVersion,
        },
    };

    try {
        const result = await dbClient.query(params).promise();
        const fetchedVulnerabilities = result.Items as VulnerabilityModel[];
        return fetchedVulnerabilities || [];
    } catch (e: any) {
        console.log("Error:", e.message);
        throw new Error(e);
    }
}