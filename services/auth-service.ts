import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || "default-secret-change-me-in-prod"
);

const ALG = "HS256";

export const authService = {
    async register(email: string, password: string): Promise<any> {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error("El usuario ya existe");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        return user;
    },

    async login(email: string, password: string): Promise<{ user: any; token: string }> {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error("Credenciales inválidas");
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new Error("Credenciales inválidas");
        }

        const token = await new SignJWT({ userId: user.id, email: user.email })
            .setProtectedHeader({ alg: ALG })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(SECRET_KEY);

        return { user, token };
    },

    async verifySession(token: string) {
        try {
            const { payload } = await jwtVerify(token, SECRET_KEY, {
                algorithms: [ALG],
            });
            return payload;
        } catch (error) {
            return null;
        }
    },

    async requestPasswordReset(email: string): Promise<void> {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Don't reveal user existence
            return;
        }

        // TODO: Generate reset token and send email
        console.log(`[MOCK] Sending password reset email to ${email}`);
    },

    async updatePassword(password: string, userId: string): Promise<void> {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    },
};
