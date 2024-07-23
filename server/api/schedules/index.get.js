import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const schedules = await prisma.Schedules.findMany({
            select: {
                id: true,
                scheduleName: true,
                scheduleCategory: true,
                shortName: true,
                scheduleLegend: true,
                scheduleClass: true,
                totalHours: true,
                firstHours: true,
                secondHours: true,
                firstIn: true,
                firstOut: true,
                secondIn: true,
                secondOut: true,
                activeStatus: true
            },
            where: {
                activeStatus: 'active'
            }
        });

        const sorted_schedules = schedules.sort((prev, next) => {
            return prev.firstIn > next.firstIn
                ? 1
                : ((prev.firstIn < next.firstIn)
                    ? -1
                    : (prev.firstOut > next.firstOut
                        ? 1
                        : ((prev.firstOut < next.firstOut)
                            ? -1
                            : (prev.secondIn > next.secondIn
                                ? 1
                                : ((prev.secondIn < next.secondIn)
                                    ? -1
                                    : (prev.secondOut > next.secondOut
                                        ? 1
                                        : ((prev.secondOut < next.secondOut)
                                            ? -1
                                            : 0)))))))
        });

        return sorted_schedules;
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