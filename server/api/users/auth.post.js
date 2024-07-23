import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const { user_id } = await readBody(event);

        const user_auth = await prisma.Users.findUnique({
            select: {
                userType: true,
                userEmail: true,

                activeStatus: true,
                employee: {
                    select: {
                        lastName: true,
                        firstName: true,
                        middleName: true,
                        genealogySuffix: true,
                        appointmentID: true,
                        employeeID: true,
                        biometricsNo: true,
                        activeStatus: true,
                        appointmentStatus: {
                            select: {
                                appointmentName: true
                            }
                        },
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
                // trainee: {
                //     select: {
                //         lastName: true,
                //         firstName: true,
                //         middleName: true,
                //         genealogySuffix: true,
                //         designation: true,
                //         traineeID: true,
                //         biometricsNo: true,
                //         organization: true
                //     }
                // },
                // remoteWorker: {
                //     select: {
                //         lastName: true,
                //         firstName: true,
                //         middleName: true,
                //         genealogySuffix: true,
                //         designation: true,
                //         remoteWorkerID: true,
                //         biometricsNo: true,
                //         organization: true
                //     }
                // },
                // agencyWorker: {
                //     select: {
                //         lastName: true,
                //         firstName: true,
                //         middleName: true,
                //         genealogySuffix: true,
                //         designation: true,
                //         agencyWorkerID: true,
                //         biometricsNo: true,
                //         organization: true
                //     }
                // },
                createdAt: true
            },
            where: {
                id: user_id
            }
        });

        // console.log('Response:');
        // console.log(user_auth);

        return user_auth;
    } catch(error) {
        console.error(error);

        return error;
    }
});