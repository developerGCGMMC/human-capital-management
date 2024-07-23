import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const fetchEmployees = prisma.Employees.findMany({
            select: {
                id: true,
                lastName: true,
                firstName: true,
                middleName: true,
                genealogySuffix: true,
                appointmentID: true,
                employeeID: true,
                biometricsNo: true,
                activeStatus: true,
                serviceID: true,
                sectionID: true,
                unitID: true,
                // service: {
                //     select: {
                //         id: true,
                //         serviceName: true
                //     }
                // },
                // section: {
                //     select: {
                //         id: true,
                //         sectionName: true
                //     }
                // },
                // unit: {
                //     select: {
                //         id: true,
                //         unitName: true
                //     }
                // }
            }
        });

        const fetchServices = prisma.Services.findMany({
            select: {
                id: true,
                serviceName: true
            }
        });
        const fetchSections = prisma.Sections.findMany({
            select: {
                id: true,
                sectionName: true
            }
        });
        const fetchUnits = prisma.Units.findMany({
            select: {
                id: true,
                unitName: true
            }
        });

        const [employees, services, sections, units] = await prisma.$transaction([fetchEmployees, fetchServices, fetchSections, fetchUnits]);

        const employees_services_sections_units = employees.reduce((accumulator, currentEmployee) => {
            accumulator.push({
                ...currentEmployee,
                service: services.reduce((accumulator, currentService) => {
                    if(currentEmployee.serviceID && currentEmployee.serviceID === currentService.id) {
                        accumulator = currentService
                    }

                    return accumulator;
                }, null),
                section: sections.reduce((accumulator, currentSection) => {
                    if(currentEmployee.sectionID && currentEmployee.sectionID === currentSection.id) {
                        accumulator = currentSection;
                    }

                    return accumulator;
                }, null),
                unit: units.reduce((accumulator, currentUnit) => {
                    if(currentEmployee.unitID && currentEmployee.unitID === currentUnit.id) {
                        accumulator = currentUnit;
                    }

                    return accumulator;
                }, null)
            });

            return accumulator;
        }, [])
        .sort((prev, next) => {
            return prev.lastName > next.lastName
                ? 1
                : ((prev.lastName < next.lastName)
                    ? -1
                    : ((prev.firstName > next.firstName)
                        ? 1
                        : ((prev.firstName < next.firstName)
                            ? -1
                            : 0)))
        });

        return employees_services_sections_units;
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