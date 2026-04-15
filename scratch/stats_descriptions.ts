
import "../lib/envBootstrap";
import { prisma } from "../lib/prisma";

async function main() {
    const total = await prisma.listing.count();
    const realDescs = await prisma.listing.count({
        where: {
            rawDescription: {
                not: {
                    contains: "AutoPulse local capture"
                }
            }
        }
    });

    console.log(`Total listings: ${total}`);
    console.log(`Real descriptions: ${realDescs}`);
    console.log(`Fallback descriptions: ${total - realDescs}`);

    const sample = await prisma.listing.findFirst({
        where: {
            rawDescription: {
                not: {
                    contains: "AutoPulse local capture"
                }
            }
        }
    });

    if (sample) {
        console.log("\nSample Real Description:");
        console.log(`ID: ${sample.id}`);
        console.log(`Content: ${sample.rawDescription?.substring(0, 200)}...`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
