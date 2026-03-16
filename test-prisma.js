const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Connecting database...");
        await prisma.$connect();
        console.log("Connected successfully.");
        const test = await prisma.workspaceMember.findMany({ take: 1 });
        console.log("Query successful, member count:", test.length);
    } catch (e) {
        console.error("Prisma error:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
