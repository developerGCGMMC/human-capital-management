import { PrismaClient } from '@prisma/client';

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
                appointmentStatus: true,
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
                id: currentEmployee.id,
                lastName: currentEmployee.lastName,
                firstName: currentEmployee.firstName,
                middleName: currentEmployee.middleName,
                genealogySuffix: currentEmployee.genealogySuffix,
                appointmentStatus: currentEmployee.appointmentStatus,
                employeeID: currentEmployee.employeeID,
                biometricsNo: currentEmployee.biometricsNo,
                activeStatus: currentEmployee.activeStatus,
                serviceID: currentEmployee.serviceID,
                sectionID: currentEmployee.sectionID,
                unitID: currentEmployee.unitID,
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
        }, []);

        const sorted_employees = employees_services_sections_units.sort((prev, next) => {
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

        // return {
        //     data: sorted_employees
        // };
        return sorted_employees;
    } catch(error) {
        console.error(error);

        return error;
    }
});