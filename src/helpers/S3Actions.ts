import * as AWS from 'aws-sdk';
import { CompanyModel, UserModel, VulnerabilityModel, VulnerabilityTypes, PackageModel, AggregatedDataModel, VulnerabilityCountModel, FetchAggregationsRequestModel } from "../models/models";

AWS.config.update({
    region: process.env.REGION as string
});

const s3 = new AWS.S3();
const bucketName: string = process.env.BUCKET_NAME;

export async function writeAggregatedDatatoS3(data: AggregatedDataModel): Promise<any> {
    const currentDate = data.createdAt;
    const formatDate = currentDate.toISOString().split('T')[0];
    const s3Key = `${data.companyId}/history/${formatDate}.json`;
    const params = {
        Bucket: bucketName,
        Key: s3Key,
        Body: JSON.stringify(data),
        ContentType: 'application/json',
    };

    return s3.upload(params).promise().then(data => { console.log(`S3 status for ${s3Key}:`, data) });
}

export async function fetchAggregatedDataForCompany(prefix: string): Promise<AWS.S3.ListObjectsV2Output> {
    const params = {
        Bucket: bucketName,
        Prefix: prefix
    };
    return s3.listObjectsV2(params).promise();
}