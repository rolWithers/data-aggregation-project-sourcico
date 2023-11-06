import { getCompanies, getUserCountForCompany, getVulnerabilitiesForPackage } from "../helpers/dynamoDbActions"
import { writeAggregatedDatatoS3 } from "../helpers/S3Actions"
import { CompanyModel, VulnerabilityModel, VulnerabilityTypes, PackageModel, AggregatedDataModel } from "../models/models";


export const handler = async () => {
    console.log(`Data aggregation start for date ${new Date}`);
    const topPackNumber = 3;
    let companies: CompanyModel[] = [];
    try {
        companies = await getCompanies();
    } catch (e: any) {
        console.log("Error fetching companies:", e.message);
        throw new Error(e);
    }
    await Promise.all(companies.map(async (c: CompanyModel) => {
        const companyName = c.companyName;
        const packages = Object.entries(c.packages);
        let vulnerabilities: VulnerabilityModel[] = [];
        const [userCount,] = await Promise.all([
            getUserCountForCompany(c.companyId),
            ...packages.map(async ([packageName, packageVersion]: [string, string]) => {
                const res = await getVulnerabilitiesForPackage(packageName, packageVersion);
                vulnerabilities = [...vulnerabilities, ...res];
            }),
        ]);
        let uniquePackages: PackageModel[] = [];
        const severities = {
            [VulnerabilityTypes.Low]: 0,
            [VulnerabilityTypes.Medium]: 0,
            [VulnerabilityTypes.High]: 0,
            [VulnerabilityTypes.Critical]: 0
        };
        vulnerabilities.map((v: VulnerabilityModel) => {
            severities[v.severity]++;
            let exist = false;
            for (const i of uniquePackages) {
                if (i.packageName === v.packageName) {
                    exist = true;
                    break;
                }
            }
            !exist ? uniquePackages.push({packageName: v.packageName, topVulnerabilityCounter: 0}): null;
            if(v.severity === VulnerabilityTypes.High || v.severity === VulnerabilityTypes.Critical){
                const pck = uniquePackages.find(p => p.packageName === v.packageName);
                if(pck) {
                    pck.topVulnerabilityCounter++;
                }            
            }
        });
        const sortedPackages = uniquePackages.sort((a, b) => a.topVulnerabilityCounter - b.topVulnerabilityCounter);
        const topThreePackages = sortedPackages.slice(0, topPackNumber);
        const finalAggregatedData: AggregatedDataModel = {
            companyId: c.companyId,
            createdAt: new Date,
            companyName,
            numberUsers: userCount || 0,
            vulnerablePackNumber: uniquePackages.length,
            vulnerableTopThree: topThreePackages,
            severitiesCounter: [
                { severity: VulnerabilityTypes.Low, count: severities[VulnerabilityTypes.Low]},
                { severity: VulnerabilityTypes.Medium, count: severities[VulnerabilityTypes.Medium]},
                { severity: VulnerabilityTypes.High, count: severities[VulnerabilityTypes.High]},
                { severity: VulnerabilityTypes.Critical, count: severities[VulnerabilityTypes.Critical]}
            ]
        }
        console.log("final aggro data:", finalAggregatedData);
        await writeAggregatedDatatoS3(finalAggregatedData);
    }));

    console.log(`Finished aggregation data cronjob for date ${new Date().toISOString().split('T')[0]}`);
    return null;
}