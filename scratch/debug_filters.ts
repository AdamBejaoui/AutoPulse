import { parseListingParams, buildListingWhere } from "./lib/listingFilters";

const testParams = [
    { city: "new-york-city" },
    { make: "BMW", model: "m3" },
    { keywords: "white honda" },
    { priceMin: "1000", priceMax: "5000" }
];

testParams.forEach(p => {
    console.log("Params:", p);
    const parsed = parseListingParams(p);
    const where = buildListingWhere(parsed);
    console.log("Where:", JSON.stringify(where, null, 2));
    console.log("-------------------");
});
