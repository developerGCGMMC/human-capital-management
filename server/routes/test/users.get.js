import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const users = await prisma.Users.findMany({
        select: {
            userEmail: true,
            userType: true,
            activeStatus: true,
            employee: {
                select: {
                    lastName: true,
                    firstName: true,
                    middleName: true,
                    genealogySuffix: true,
                    appointmentStatus: true,
                    employeeID: true,
                    biometricsNo: true,
                    service: {
                        select: {
                            serviceName: true
                        }
                    },
                    section: {
                        select: {
                            sectionName: true
                        }
                    },
                    unit: {
                        select: {
                            unitName: true
                        }
                    }
                }
            },
            trainee: {
                select: {
                    lastName: true,
                    firstName: true,
                    middleName: true,
                    genealogySuffix: true,
                    designation: true,
                    traineeID: true,
                    biometricsNo: true,
                    organization: true
                }
            },
            remoteWorker: {
                select: {
                    lastName: true,
                    firstName: true,
                    middleName: true,
                    genealogySuffix: true,
                    designation: true,
                    remoteWorkerID: true,
                    biometricsNo: true,
                    organization: true
                }
            },
            agencyWorker: {
                select: {
                    lastName: true,
                    firstName: true,
                    middleName: true,
                    genealogySuffix: true,
                    designation: true,
                    agencyWorkerID: true,
                    biometricsNo: true,
                    organization: true
                }
            },
            createdAt: true
        },
        orderBy: [
            {
                employee: {
                    lastName: 'asc'
                }
            },
            {
                trainee: {
                    lastName: 'asc'
                }
            },
            {
                remoteWorker: {
                    lastName: 'asc'
                }
            },
            {
                agencyWorker: {
                    lastName: 'asc'
                }
            }
        ]
    });

    return users;
});