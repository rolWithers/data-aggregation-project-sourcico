import { fetchAggregatedDataForCompany } from "../helpers/S3Actions";
import { FetchAggregationsRequestModel } from "../models/models";

export const handler = async (event: FetchAggregationsRequestModel): Promise<string[]> => {
    console.log("event:", event);
    // assuming start and end dates will have YYYY-MM-DD format
    const start = event.startDate.split("-");
    const end = event.endDate.split("-");
    let year = parseInt(start[0]);
    let month = parseInt(start[1]);
    let contents = [];
    do {
        try {
            const prefix = `${event.companyId}/history/${year}-${month}-`
            const objects = await fetchAggregatedDataForCompany(prefix);
            if(objects.Contents.length > 0) {
                contents = contents.concat(objects.Contents);
            }
        } catch (e: any) {
            console.log("Error fetching S3 files:", e.message);
            throw new Error(e);
        }
        month++;
        if(month > 12) {
            month = 1;
            year++;
        }
    } while(year < parseInt(end[0]) || (year <= parseInt(end[0]) && month <= parseInt(end[1])));
    let result: string[] = [];
    contents.map((c: any) => {
        result.push(c.Key);
    });
    return result;
}