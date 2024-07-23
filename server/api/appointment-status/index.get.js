import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const appointment_status = await prisma.AppointmentStatus.findMany({
            select: {
                id: true,
                appointmentName: true
            }
        });

        return appointment_status;
    } catch(error) {
        if(error instanceof Prisma.PrismaClientKnownRequestError || error instanceof Prisma.PrismaClientUnknownRequestError
            || error instanceof Prisma.PrismaClientRustPanicError || error instanceof Prisma.PrismaClientInitializationError
            || error instanceof Prisma.PrismaClientValidationError) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Database connection, authentication, validation etc. error'
            });
        }

        console.error(error);

        return error;
    }
});