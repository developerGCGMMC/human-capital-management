import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        // const raw_services = await prisma.Services.findMany({
        //     select: {
        //         id: true,
        //         serviceName: true,
        //         sections: {
        //             select: {
        //                 id: true,
        //                 serviceID: true,
        //                 sectionName: true,
        //                 sectionAbbreviation: true,
        //                 isServiceHead: true,
        //                 units: {
        //                     select: {
        //                         id: true,
        //                         unitName: true,
        //                         unitAbbreviation: true
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // });

        // const sorted_services = raw_services.reduce((accumulator, currentService) => {
        //     accumulator.push({
        //         id: currentService.id,
        //         serviceName: currentService.serviceName,
        //         sections: currentService.sections.reduce((accumulator, currentSection) => {
        //             accumulator.push({
        //                 id: currentSection.id,
        //                 sectionName: currentSection.sectionName,
        //                 // sectionAbbreviation: currentSection.sectionAbbreviation,
        //                 // isServiceHead: currentSection.isServiceHead,
        //                 units: currentSection.units.reduce((accumulator, currentUnit) => {
        //                     accumulator.push({
        //                         id: currentUnit.id,
        //                         unitName: currentUnit.unitName,
        //                         // unitAbbreviation: currentUnit.unitAbbreviation
        //                     });

        //                     return accumulator;
        //                 }, [])
        //                 .sort((prev, next) => {
        //                     return prev.unitName > next.unitName
        //                         ? 1
        //                         : ((prev.unitName < next.unitName)
        //                             ? -1
        //                             : 0);
        //                 })
        //             });

        //             return accumulator;
        //         }, [])
        //         .sort((prev, next) => {
        //             return prev.sectionName > next.sectionName
        //                 ? 1
        //                 : ((prev.sectionName < next.sectionName)
        //                     ? -1
        //                     : 0);
        //         })
        //     });

        //     return accumulator;
        // }, [])
        // .sort((prev, next) => {
        //     return prev.serviceName > next.serviceName
        //         ? 1
        //         : (prev.serviceName < next.serviceName
        //             ? -1
        //             : 0);
        // });

        // ! ----------------------------------------------------------------------------------------------------

        const fetchServices = prisma.Services.findMany({
            select: {
                id: true,
                serviceName: true,
            }
        });
        const fetchSections = prisma.Sections.findMany({
            select: {
                id: true,
                serviceID: true,
                sectionName: true,
                sectionAbbreviation: true,
                isServiceHead: true
            }
        });
        const fetchUnits = prisma.Units.findMany({
            select: {
                id: true,
                sectionID: true,
                unitName: true,
                unitAbbreviation: true
            }
        });

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

        const [fetched_services, fetched_sections, fetched_units, fetched_employees] = await prisma.$transaction([fetchServices, fetchSections, fetchUnits, fetchEmployees]);

        // ! ----------------------------------------------------------------------------------------------------

        const services_sections_units = fetched_services.reduce((accumulator, currentService) => {
            accumulator.push({
                ...currentService,
                sections: fetched_sections.reduce((accumulator, currentSection) => {
                    if(currentSection.serviceID === currentService.id) {
                        accumulator.push({
                            ...currentSection,
                            isSectionHead: (fetched_units.reduce((accumulator, currentUnit) => accumulator + (currentUnit.sectionID === currentSection.id ? 1 : 0), 0) != 0)
                                ? 'true'
                                : 'false',
                            units: fetched_units.reduce((accumulator, currentUnit) => {
                                if(currentUnit.sectionID === currentSection.id) {
                                    accumulator.push(currentUnit);
                                }

                                return accumulator;
                            }, [])
                            .sort((prev, next) => {
                                return prev.unitName > next.unitName
                                    ? 1
                                    : (prev.unitName < next.unitName
                                        ? -1
                                        : 0);
                            })
                        });
                    }

                    return accumulator;
                }, [])
                .sort((prev, next) => {
                    return prev.isServiceHead < next.isServiceHead
                        ? 1
                        : (prev.isServiceHead > next.isServiceHead
                            ? -1
                            : (prev.sectionName > next.sectionName
                                ? 1
                                : (prev.sectionName < next.sectionName
                                    ? -1
                                    : 0)));
                })
            });

            return accumulator;
        }, []);

        const employees = fetched_employees.reduce((accumulator, currentEmployee) => {
            accumulator.push({
                ...currentEmployee,
                fullName: currentEmployee.lastName+', '+currentEmployee.firstName,
                service: fetched_services.reduce((accumulator, currentService) => {
                    if(currentEmployee.serviceID && currentEmployee.serviceID === currentService.id) {
                        accumulator = currentService
                    }

                    return accumulator;
                }, null),
                section: fetched_sections.reduce((accumulator, currentSection) => {
                    if(currentEmployee.sectionID && currentEmployee.sectionID === currentSection.id) {
                        accumulator = {
                            ...currentSection,
                            isSectionHead: (fetched_units.reduce((accumulator, currentUnit) => accumulator + (currentUnit.sectionID === currentSection.id ? 1 : 0), 0) != 0)
                                ? 'true'
                                : 'false',
                        };
                    }

                    return accumulator;
                }, null),
                unit: fetched_units.reduce((accumulator, currentUnit) => {
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

        // ! ----------------------------------------------------------------------------------------------------

        const service_offices = services_sections_units.reduce((accumulator, currentService) => {
            accumulator.push({
                id: currentService.id,
                serviceName: currentService.serviceName,
                offices: currentService.sections.reduce((accumulator, currentSection) => {
                    if(currentSection.serviceID === currentService.id) {
                        accumulator.push(
                            {
                                officeID: currentSection.id,
                                officeName: currentSection.sectionName,
                                type: 'section',
                                isServiceHead: currentSection.isServiceHead,
                                isSectionHead: currentSection.isSectionHead,
                                unitIDs: currentSection.units.reduce((accumulator, currentUnit) => {
                                    accumulator.push(currentUnit.id);

                                    return accumulator;
                                }, [])
                            },
                            ...currentSection.units.reduce((accumulator, currentUnit) => {
                                accumulator.push({
                                    officeID: currentUnit.id,
                                    officeName: currentUnit.unitName,
                                    type: 'unit',
                                    isServiceHead: 'false',
                                    isSectionHead: 'false',
                                    unitIDs: []
                                });

                                return accumulator;
                            }, [])
                        );
                    }

                    return accumulator;
                }, [])
                .sort((prev, next) => {
                    return prev.isServiceHead > next.isServiceHead
                        ? -1
                        : (prev.isServiceHead < next.isServiceHead
                            ? 1
                            : (prev.officeName > next.officeName
                                ? 1
                                : (prev.officeName < next.officeName
                                    ? -1
                                    : 0)));
                })
            });

            return accumulator;
        }, []);

        // ! ----------------------------------------------------------------------------------------------------

        const office_employees = services_sections_units.reduce((accumulator, currentService) => {
            accumulator.push(...currentService.sections.reduce((accumulator, currentSection) => {
                if(currentSection.serviceID === currentService.id) {
                    accumulator.push(
                        {
                            serviceID: currentService.id,
                            serviceName: currentService.serviceName,
                            officeID: currentSection.id,
                            officeName: currentSection.sectionName,
                            sectionID: currentSection.id,
                            unitID: null,
                            type: 'section',
                            isServiceHead: currentSection.isServiceHead,
                            isSectionHead: currentSection.isSectionHead,
                            employees: employees.reduce((accumulator, currentEmployee) => {
                                if(currentEmployee.sectionID === currentSection.id) {
                                    accumulator.push(currentEmployee);
                                }

                                return accumulator;
                            }, [])
                        },
                        ...currentSection.units.reduce((accumulator, currentUnit) => {
                            accumulator.push({
                                serviceID: currentService.id,
                                serviceName: currentService.serviceName,
                                officeID: currentUnit.id,
                                officeName: currentUnit.unitName,
                                sectionID: currentSection.id,
                                unitID: currentUnit.id,
                                type: 'unit',
                                isServiceHead: 'false',
                                isSectionHead: 'false',
                                employees: employees.reduce((accumulator, currentEmployee) => {
                                    if(currentEmployee.unitID === currentUnit.id) {
                                        accumulator.push(currentEmployee);
                                    }

                                    return accumulator;
                                }, [])
                            });

                            return accumulator;
                        }, [])
                    );
                }

                return accumulator;
            }, []));

            return accumulator;
        }, [])
        .sort((prev, next) => {
            return prev.officeName > next.officeName
                ? 1
                : (prev.officeName < next.officeName
                    ? -1
                    : 0);
        });

        // ! ----------------------------------------------------------------------------------------------------

        return {
            // raw_services: raw_services,
            // services_sections_units: services_sections_units,
            // employees: employees,

            service_offices: service_offices,
            office_employees: office_employees
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

        console.error(error);

        return error;
    }
});