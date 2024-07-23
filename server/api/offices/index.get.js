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

        const [fetched_services, fetched_sections, fetched_units] = await prisma.$transaction([fetchServices, fetchSections, fetchUnits]);

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
                    // isServiceHead === true, officeName
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

        // ! ----------------------------------------------------------------------------------------------------

        const service_names = fetched_services.reduce((accumulator, currentService) => {
            accumulator.push(currentService.serviceName);

            return accumulator;
        }, []);

        const section_names = fetched_sections.reduce((accumulator, currentSection) => {
            accumulator.push(currentSection.sectionName);

            return accumulator;
        }, [])
        .sort((prev, next) => {
            return prev > next
                ? 1
                : (prev < next
                    ? -1
                    : 0);
        });

        const unit_names = fetched_units.reduce((accumulator, currentUnit) => {
            accumulator.push(currentUnit.unitName);

            return accumulator;
        }, [])
        .sort((prev, next) => {
            return prev > next
                ? 1
                : (prev < next
                    ? -1
                    : 0);
        });

        const office_names = [...section_names, ...unit_names]
        .sort((prev, next) => {
            return prev > next
                ? 1
                : (prev < next
                    ? -1
                    : 0);
        });

        // ! ----------------------------------------------------------------------------------------------------

        const service_ids = fetched_services.reduce((accumulator, currentService) => {
            accumulator.push({
                id: currentService.id,
                serviceName: currentService.serviceName
            });

            return accumulator;
        }, []);

        const section_ids = fetched_sections.reduce((accumulator, currentSection) => {
            accumulator.push({
                id: currentSection.id,
                sectionName: currentSection.sectionName
            });

            return accumulator;
        }, [])
        .sort((prev, next) => {
            return prev.sectionName > next.sectionName
                ? 1
                : (prev.sectionName < next.sectionName
                    ? -1
                    : 0);
        });

        const unit_ids = fetched_units.reduce((accumulator, currentUnit) => {
            accumulator.push({
                id: currentUnit.id,
                unitName: currentUnit.unitName
            });

            return accumulator;
        }, [])
        .sort((prev, next) => {
            return prev.unitName > next.unitName
                ? 1
                : (prev.unitName < next.unitName
                    ? -1
                    : 0);
        });

        const office_ids = [
            ...section_ids.reduce((accumulator, current) => {
                accumulator.push({
                    id: current.id,
                    officeName: current.sectionName
                });

                return accumulator;
            }, []),
            ...unit_ids.reduce((accumulator, current) => {
                accumulator.push({
                    id: current.id,
                    officeName: current.unitName
                });

                return accumulator;
            }, [])
        ]
        .sort((prev, next) => {
            return prev.officeName > next.officeName
                ? 1
                : (prev.officeName < next.officeName
                    ? -1
                    : 0);
        });

        // ! ----------------------------------------------------------------------------------------------------

        // const office_map = [
        //     ...services_sections_units.reduce((accumulator, currentService) => {
        //         accumulator.push(...currentService.sections.reduce((accumulator, currentSection) => {
        //             accumulator.push({
        //                 officeType: 'section',
        //                 officeID: currentSection.id,
        //                 officeName: currentSection.sectionName,
        //                 officeAbbreviation: currentSection.sectionAbbreviation,
        //                 isServiceHead: currentSection.isServiceHead,
        //                 isSectionHead: currentSection.units.length != 0 ? 'true' : 'false',
        //                 serviceID: currentService.id,
        //                 serviceName: currentService.serviceName,
        //                 sectionID: currentSection.id,
        //                 sectionName: currentSection.sectionName,
        //                 unitID: null,
        //                 unitName: null,
        //                 unitIDs: currentSection.units.reduce((accumulator, currentUnit) => {
        //                     accumulator.push(currentUnit.id);

        //                     return accumulator;
        //                 }, [])
        //             });

        //             return accumulator;
        //         }, []));

        //         return accumulator;
        //     }, []),
        //     ...services_sections_units.reduce((accumulator, currentService) => {
        //         accumulator.push(...currentService.sections.reduce((accumulator, currentSection) => {
        //             accumulator.push(...currentSection.units.reduce((accumulator, currentUnit) => {
        //                 accumulator.push({
        //                     officeType: 'unit',
        //                     officeID: currentUnit.id,
        //                     officeName: currentUnit.unitName,
        //                     officeAbbreviation: currentUnit.unitAbbreviation,
        //                     isServiceHead: 'false',
        //                     isSectionHead: 'false',
        //                     serviceID: currentService.id,
        //                     serviceName: currentService.serviceName,
        //                     sectionID: currentSection.id,
        //                     sectionName: currentSection.sectionName,
        //                     unitID: currentUnit.id,
        //                     unitName: currentUnit.unitName,
        //                     unitIDs: []
        //                 });

        //                 return accumulator;
        //             }, []));

        //             return accumulator;
        //         }, []));

        //         return accumulator;
        //     }, [])
        // ]
        // .sort((prev, next) => {
        //     return prev.officeName > next.officeName
        //         ? 1
        //         : (prev.officeName < next.officeName
        //             ? -1
        //             : 0);
        // });

        const office_map = services_sections_units.reduce((accumulator, currentService) => {
            accumulator.push(...currentService.sections.reduce((accumulator, currentSection) => {
                accumulator.push(
                    {
                        officeType: 'section',
                        officeID: currentSection.id,
                        officeName: currentSection.sectionName,
                        officeAbbreviation: currentSection.sectionAbbreviation,
                        serviceID: currentService.id,
                        serviceName: currentService.serviceName,
                        isServiceHead: currentSection.isServiceHead,
                        sectionID: currentSection.id,
                        sectionName: currentSection.sectionName,
                        isSectionHead: currentSection.isSectionHead,
                        unitID: null,
                        unitName: null,
                        unitIDs: currentSection.units.reduce((accumulator, currentUnit) => {
                            accumulator.push(currentUnit.id);

                            return accumulator;
                        }, [])
                    },
                    ...currentSection.units.reduce((accumulator, currentUnit) => {
                        accumulator.push({
                            officeType: 'unit',
                            officeID: currentUnit.id,
                            officeName: currentUnit.unitName,
                            officeAbbreviation: currentUnit.unitAbbreviation,
                            serviceID: currentService.id,
                            serviceName: currentService.serviceName,
                            isServiceHead: 'false',
                            sectionID: currentSection.id,
                            sectionName: currentSection.sectionName,
                            isSectionHead: 'false',
                            unitID: currentUnit.id,
                            unitName: currentUnit.unitName,
                            unitIDs: []
                        });

                        return accumulator;
                    }, [])
                );

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

        // const service_offices = services_sections_units.reduce((accumulator, currentService) => {
        //     accumulator.push({
        //         id: currentService.id,
        //         serviceName: currentService.serviceName,
        //         offices: currentService.sections.reduce((accumulator, currentSection) => {
        //             if(currentSection.serviceID === currentService.id) {
        //                 accumulator.push(
        //                     {
        //                         officeID: currentSection.id,
        //                         officeName: currentSection.sectionName,
        //                         type: 'section',
        //                         isServiceHead: currentSection.isServiceHead,
        //                         isSectionHead: currentSection.isSectionHead
        //                     },
        //                     ...currentSection.units.reduce((accumulator, currentUnit) => {
        //                         accumulator.push({
        //                             officeID: currentUnit.id,
        //                             officeName: currentUnit.unitName,
        //                             type: 'unit',
        //                             isServiceHead: 'false',
        //                             isSectionHead: 'false'
        //                         });

        //                         return accumulator;
        //                     }, [])
        //                 );
        //             }

        //             return accumulator;
        //         }, [])
        //         .sort((prev, next) => {
        //             return prev.isServiceHead > next.isServiceHead
        //                 ? -1
        //                 : (prev.isServiceHead < next.isServiceHead
        //                     ? 1
        //                     : (prev.officeName > next.officeName
        //                         ? 1
        //                         : (prev.officeName < next.officeName
        //                             ? -1
        //                             : 0)));
        //         })
        //     });

        //     return accumulator;
        // }, []);

        // ! ----------------------------------------------------------------------------------------------------

        return {
            // raw_services: raw_services,
            services_sections_units: services_sections_units,
            service_names: service_names,
            section_names: section_names,
            unit_names: unit_names,
            office_names: office_names,

            service_ids: service_ids,
            section_ids: section_ids,
            unit_ids: unit_ids,
            office_ids: office_ids,

            office_map: office_map,

            // service_offices: service_offices
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