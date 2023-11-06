export interface CompanyModel {
    companyId: string;
    packages: Packages;
    companyName: string;
}

export interface UserModel {
    userId: string;
    companyId: string;
}

export interface VulnerabilityModel {
    vulnerabilityId: string;
    vulnerabilityCode: string;
    severity: VulnerabilityTypes;
    packageType: string;
    packageName: string;
    packageVersion: string;
    description: string;
}

export interface Packages {
    [key: string]: string;
}

export enum VulnerabilityTypes {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
    Critical = 'critical',
}

export interface PackageModel {
    packageName: string;
    topVulnerabilityCounter: number;
}

export interface AggregatedDataModel {
    companyId: string,
    createdAt: Date,
    companyName: string,
    numberUsers: number,
    vulnerablePackNumber: number,
    vulnerableTopThree: PackageModel[],
    severitiesCounter: VulnerabilityCountModel[]
}

export interface VulnerabilityCountModel {
    severity: VulnerabilityTypes,
    count: number
}

export interface FetchAggregationsRequestModel {
    companyId: string,
    startDate: string,
    endDate: string
}