import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const oldEmail = "heredialucasfac22@gmail.com";
    const newEmail = "admin@gmail.com";
    const newPasswordRaw = "Admin123.";

    console.log(`Searching for user with email: ${oldEmail}`);

    const user = await prisma.user.findUnique({
        where: { email: oldEmail },
    });

    if (!user) {
        console.error(`User with email ${oldEmail} not found!`);
        // Fallback: Check if already updated?
        const alreadyUpdated = await prisma.user.findUnique({
            where: { email: newEmail }
        });
        if (alreadyUpdated) {
            console.log("Found user with new email already. Updating password just in case.");
            const hashedPassword = await bcrypt.hash(newPasswordRaw, 10);
            await prisma.user.update({
                where: { email: newEmail },
                data: {
                    password: hashedPassword,
                }
            });
            console.log("Password updated successfully.");
            return;
        }
        return;
    }

    console.log(`User found. Updating email to ${newEmail} and setting new password...`);

    const hashedPassword = await bcrypt.hash(newPasswordRaw, 10);

    const updatedUser = await prisma.user.update({
        where: { email: oldEmail },
        data: {
            email: newEmail,
            password: hashedPassword,
        },
    });

    console.log("User updated successfully:", updatedUser.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
