import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const { user_id, selected_employee } = await readBody(event);

        const admin_user = await prisma.Users.findUnique({
            select: {
                employeeID: true
            },
            where: {
                id: user_id
            }
        });

        if(!admin_user.employeeID) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized'
            });
        }

        // ! ----------------------------------------------------------------------------------------------------

        if(!selected_employee.lastName || !selected_employee.firstName
            || !selected_employee.appointmentID || !selected_employee.employeeID || !selected_employee.biometricsNo
            || !selected_employee.serviceID || !selected_employee.sectionID) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing fields'
            });
        }

        // ! ----------------------------------------------------------------------------------------------------

        if(selected_employee.id) {
            try {
                const updated_employee = await prisma.Employees.update({
                    data: {
                        lastName: selected_employee.lastName,
                        firstName: selected_employee.firstName,
                        middleName: selected_employee.middleName,
                        genealogySuffix: selected_employee.genealogySuffix,
                        appointmentID: selected_employee.appointmentID,
                        employeeID: selected_employee.employeeID,
                        biometricsNo: selected_employee.biometricsNo,
                        serviceID: selected_employee.serviceID,
                        sectionID: selected_employee.sectionID,
                        unitID: selected_employee.unitID
                    },
                    where: {
                        id: selected_employee.id
                    },
                    select: {
                        id: true,
                        lastName: true,
                        firstName: true,
                        middleName: true,
                        genealogySuffix: true,
                        appointmentID: true,
                        employeeID: true,
                        biometricsNo: true,
                        serviceID: true,
                        sectionID: true,
                        unitID: true,
                        service: {
                            select: {
                                id: true,
                                serviceName: true
                            }
                        },
                        section: {
                            select: {
                                id: true,
                                sectionName: true
                            }
                        },
                        unit: {
                            select: {
                                id: true,
                                unitName: true
                            }
                        }
                    }
                });

                // if(!updated_employee) {
                //     throw createError({
                //         statusCode: 400,
                //         statusMessage: 'Error: Employee editing.'
                //     });
                // }

                return {
                    status: 'updated',
                    data: {
                        employee: updated_employee
                    }
                }
            } catch(error) {
                if(error instanceof Prisma.PrismaClientKnownRequestError || error instanceof Prisma.PrismaClientUnknownRequestError
                    || error instanceof Prisma.PrismaClientRustPanicError || error instanceof Prisma.PrismaClientInitializationError
                    || error instanceof Prisma.PrismaClientValidationError) {
                    throw createError({
                        statusCode: 400,
                        statusMessage: 'Database connection, authentication, validation etc. error'
                    });
                }
            }
        } else {
            try {
                const registered_employee = await prisma.Employees.create({
                    data: {
                        lastName: selected_employee.lastName,
                        firstName: selected_employee.firstName,
                        middleName: selected_employee.middleName,
                        genealogySuffix: selected_employee.genealogySuffix,
                        appointmentID: selected_employee.appointmentID,
                        employeeID: selected_employee.employeeID,
                        biometricsNo: selected_employee.biometricsNo,
                        serviceID: selected_employee.serviceID,
                        sectionID: selected_employee.sectionID,
                        unitID: selected_employee.unitID
                    },
                    select: {
                        id: true,
                        lastName: true,
                        firstName: true,
                        middleName: true,
                        genealogySuffix: true,
                        appointmentID: true,
                        employeeID: true,
                        biometricsNo: true,
                        serviceID: true,
                        sectionID: true,
                        unitID: true,
                        service: {
                            select: {
                                id: true,
                                serviceName: true
                            }
                        },
                        section: {
                            select: {
                                id: true,
                                sectionName: true
                            }
                        },
                        unit: {
                            select: {
                                id: true,
                                unitName: true
                            }
                        }
                    }
                });

                // if(!registered_employee) {
                //     throw createError({
                //         statusCode: 400,
                //         statusMessage: 'Error: Employee registration'
                //     });
                // }

                return {
                    status: 'registered',
                    data: {
                        employee: registered_employee
                    }
                };
            } catch(error) {
                if(error instanceof Prisma.PrismaClientKnownRequestError || error instanceof Prisma.PrismaClientUnknownRequestError
                    || error instanceof Prisma.PrismaClientRustPanicError || error instanceof Prisma.PrismaClientInitializationError
                    || error instanceof Prisma.PrismaClientValidationError) {
                    throw createError({
                        statusCode: 400,
                        statusMessage: 'Database connection, authentication, validation etc. error'
                    });
                }
            }
        }
    } catch(error) {
        console.error(error);

        return error;
    }
});