AWS:
  ACCESS KEY: 
  SECRET KEY: 
  REGION: eu-central-1
  ACCOUNT ID: 

Infrastructure:

runtime: nodejs18.x
serverless.yml configuration for CloudFormation Stack deployment of resources and roles/policies

1 S3 bucket (aggregated-vulnerability-data) to store JSON files of aggregated data results

3 DynamoDB tables
  CompanyTable:
        Type: AWS::DynamoDB::Table
        Properties:
          TableName: Company
          AttributeDefinitions:
            - AttributeName: companyId
              AttributeType: S
          KeySchema:
            - AttributeName: companyId
              KeyType: HASH
          BillingMode: PAY_PER_REQUEST
  Company example:
  {
    companyId: "213f8ce7-8cf7-44c1-bdf4-4db2e5ee814f",
    companyName: "company1",
    packages: {
      "package1": "0.1.0",
      "package2": "1.2.10",
      "package3": "0.2.0"
    }
  }

  UserTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: User
        AttributeDefinitions:
          - AttributeName: userId
            AttributeType: S
          - AttributeName: companyId
            AttributeType: S
        KeySchema:
          - AttributeName: userId
            KeyType: HASH
          - AttributeName: companyId
            KeyType: RANGE
        BillingMode: PAY_PER_REQUEST
  User example:
  {
    userId: "364a2aed-aa9f-4688-8b9f-5206043e1bdc",
    companyId: "213f8ce7-8cf7-44c1-bdf4-4db2e5ee814f"
  }

  VulnerabilityTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: Vulnerability
        AttributeDefinitions:
          - AttributeName: vulnerabilityId
            AttributeType: S
          - AttributeName: packageName
            AttributeType: S
          - AttributeName: packageVersion
            AttributeType: S
        KeySchema:
          - AttributeName: vulnerabilityId
            KeyType: HASH
          - AttributeName: packageName
            KeyType: RANGE
        GlobalSecondaryIndexes:
          - IndexName: PackageNameVersionIndex
            KeySchema:
              - AttributeName: packageName
                KeyType: HASH
              - AttributeName: packageVersion
                KeyType: RANGE
            Projection:
              ProjectionType: ALL
        BillingMode: PAY_PER_REQUEST
  Vulnerability example:
  {
  "vulnerabilityId": "1b6f5417-f98d-4dd1-8d87-2fcbf7bcd78a",
  "packageName": "package1",
  "description": "test description",
  "packageType": "npm",
  "packageVersion": "0.1.0",
  "severity": "high",
  "vulnerabilityCode": "CVE-2020-28473"
}

2 Lambda functions:
  dataAggregatorCronjob function, has a cronjob Event that triggers once every 24 hours, no input or output parameters. Fetches all companies, aggregates data and stores the JSON result in the S3 bucket

  getAggregatedDataForCompany function, fetches all S3 fil object keys that satisfy the input parameters.
  Input: 
  { "companyId" : "213f8ce7-8cf7-44c1-bdf4-4db2e5ee814f", "startDate" : "2022-09-01", "endDate" : "2023-11-10"}
  Normally, RESTful API would be configured using Express and API Gateway, but due to time constraints i wasn't able to set it up. Function can only be manually invoked for now

  Additional plugins:
  - serverless-dynamodb-local
  - serverless-offline
  - serverless-plugin-typescript

How to test locally:

Set up AWS profile using the above mentioned AWS parameters

npm i

npm run build

serverless invoke local -f dataAggregatorCronjob

serverless invoke local -f getAggregatedDataForCompany --data '{ "companyId" : "213f8ce7-8cf7-44c1-bdf4-4db2e5ee814f", "startDate" : "2022-09-01", "endDate" : "2023-11-1"}'

Database seeding was not done, there is a little bit of data manually input in the DynamoDB tables for basic testing

