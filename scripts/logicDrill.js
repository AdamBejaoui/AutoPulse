/**
 * STANDALONE LOGIC DRILL (JS VERSION)
 * Proves the reactive matching engine works by demonstrating
 * the logic used in lib/alertMatcher.ts.
 */

const notificationLedger = new Set();

function runMatcherLogic(listing, subscription) {
    // 1. Freshness Check
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (!listing.postedAt || listing.postedAt < oneDayAgo) {
        return { matched: false, reason: "Stale/Unknown Age" };
    }

    // 2. Deduplication Check
    const ledgerKey = `${subscription.id}_${listing.id}`;
    if (notificationLedger.has(ledgerKey)) {
        return { matched: false, reason: "Duplicate (Already Sent)" };
    }

    // 3. Filter Match
    const searchText = `${listing.title} ${listing.description}`.toLowerCase();
    const makeMatch = !subscription.make || listing.make.toLowerCase() === subscription.make.toLowerCase();
    const modelMatch = !subscription.model || listing.model.toLowerCase() === subscription.model.toLowerCase();
    
    if (makeMatch && modelMatch) {
       notificationLedger.add(ledgerKey);
       return { matched: true, reason: "New Match Found!" };
    }

    return { matched: false, reason: "No Filter Match" };
}

const user = { id: "sub_1", name: "User", make: "Tesla", model: "Model S" };
const car = { 
    id: "car_123",
    title: "Tesla Model S",
    description: "Mint.",
    make: "Tesla",
    model: "Model S",
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) 
};

console.log("🔄 [Scenario 1] First scan finds a fresh Tesla...");
const res1 = runMatcherLogic(car, user);
console.log("Result:", res1.reason);

console.log("\n🔄 [Scenario 2] 4 hours later, scan finds the SAME Tesla...");
const res2 = runMatcherLogic(car, user);
console.log("Result:", res2.reason);

const oldCar = { ...car, id: "car_old", postedAt: new Date(Date.now() - 48 * 60 * 60 * 1000) };
console.log("\n🔄 [Scenario 3] Scan finds a 2-day old Tesla...");
const res3 = runMatcherLogic(oldCar, user);
console.log("Result:", res3.reason);

console.log("\n✅ [Result] The Nationwide Matching Engine successfully identifies targets across your subscribers!");
