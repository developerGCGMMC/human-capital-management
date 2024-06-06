import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const data = await prisma.Services.findMany({
        select: {
            id: true,
            serviceName: true,
            sections: {
                select: {
                    id: true,
                    sectionName: true,
                    sectionAbbreviation: true,
                    isServiceHead: true,
                    units: {
                        select: {
                            id: true,
                            unitName: true,
                            unitAbbreviation: true
                        }
                    }
                }
            }
        }
    });

    // ! ----------------------------------------------------------------------------------------------------

    const sorted_services = data.reduce((accumulator, current) => {
        accumulator.push({
            id: current.id,
            serviceName: current.serviceName,
            sections: current.sections.reduce((accumulator, current) => {
                accumulator.push({
                    id: current.id,
                    sectionName: current.sectionName,
                    sectionAbbreviation: current.sectionAbbreviation,
                    isServiceHead: current.isServiceHead,
                    units: current.units.reduce((accumulator, current) => {
                        accumulator.push({
                            id: current.id,
                            unitName: current.unitName,
                            unitAbbreviation: current.unitAbbreviation
                        });

                        return accumulator;
                    }, [])
                    .sort((prev, next) => {
                        return prev.unitName > next.unitName
                            ? 1
                            : ((prev.unitName < next.unitName)
                                ? -1
                                : 0);
                    })
                });

                return accumulator;
            }, [])
            .sort((prev, next) => {
                return prev.sectionName > next.sectionName
                    ? 1
                    : ((prev.sectionName < next.sectionName)
                        ? -1
                        : 0);
            })
        });

        return accumulator;
    }, [])
    .sort((prev, next) => {
        return prev.serviceName > next.serviceName
            ? 1
            : ((prev.serviceName < next.serviceName)
                ? -1
                : 0);
    });

    // ! ----------------------------------------------------------------------------------------------------

    const service_names = sorted_services.reduce((accumulator, current) => {
        accumulator.push(current.serviceName);

        return accumulator;
    }, []);

    // ! ----------------------------------------------------------------------------------------------------

    const section_names = sorted_services.reduce((accumulator, current) => {
        accumulator.push(...current.sections.reduce((accumulator, current) => {
            accumulator.push(current.sectionName);

            return accumulator;
        }, []));

        return accumulator;
    }, [])
    .sort((prev, next) => {
        return prev > next
            ? 1
            : ((prev < next)
                ? -1
                : 0);
    });

    // ! ----------------------------------------------------------------------------------------------------

    const unit_names = sorted_services.reduce((accumulator, current) => {
        accumulator.push(...current.sections.reduce((accumulator, current) => {
            accumulator.push(...current.units.reduce((accumulator, current) => {
                accumulator.push(current.unitName);

                return accumulator;
            }, []));

            return accumulator;
        }, []));

        return accumulator;
    }, [])
    .sort((prev, next) => {
        return prev > next
            ? 1
            : ((prev < next)
                ? -1
                : 0);
    });

    // ! ----------------------------------------------------------------------------------------------------

    const office_names = [...section_names, ...unit_names]
    .sort((prev, next) => {
        return prev > next
            ? 1
            : ((prev < next)
                ? -1
                : 0);
    });

    // ! ----------------------------------------------------------------------------------------------------

    const service_ids = sorted_services.reduce((accumulator, current) => {
        accumulator.push({
            id: current.id,
            serviceName: current.serviceName
        });

        return accumulator;
    }, []);

    // ! ----------------------------------------------------------------------------------------------------

    const section_ids = sorted_services.reduce((accumulator, current) => {
        accumulator.push(...current.sections.reduce((accumulator, current) => {
            accumulator.push({
                id: current.id,
                sectionName: current.sectionName
            });

            return accumulator;
        }, []));

        return accumulator;
    }, [])
    .sort((prev, next) => {
        return prev.sectionName > next.sectionName
            ? 1
            : ((prev.sectionName < next.sectionName)
                ? -1
                : 0);
    });

    // ! ----------------------------------------------------------------------------------------------------

    const unit_ids = sorted_services.reduce((accumulator, current) => {
        accumulator.push(...current.sections.reduce((accumulator, current) => {
            accumulator.push(...current.units.reduce((accumulator, current) => {
                accumulator.push({
                    id: current.id,
                    unitName: current.unitName
                });

                return accumulator;
            }, []));

            return accumulator;
        }, []));

        return accumulator;
    }, [])
    .sort((prev, next) => {
        return prev.unitName > next.unitName
            ? 1
            : ((prev.unitName < next.unitName)
                ? -1
                : 0);
    });

    // ! ----------------------------------------------------------------------------------------------------

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
            : ((prev.officeName < next.officeName)
                ? -1
                : 0);
    });

    // ! ----------------------------------------------------------------------------------------------------

    const office_map = [
        ...sorted_services.reduce((accumulator, currentService) => {
            accumulator.push(...currentService.sections.reduce((accumulator, currentSection) => {
                accumulator.push({
                    officeType: 'section',
                    officeID: currentSection.id,
                    officeName: currentSection.sectionName,
                    officeAbbreviation: currentSection.sectionAbbreviation,
                    isServiceHead: currentSection.isServiceHead,
                    serviceID: currentService.id,
                    serviceName: currentService.serviceName,
                    sectionID: currentSection.id,
                    sectionName: currentSection.sectionName,
                    unitID: null,
                    unitName: null,
                    unitIDs: currentSection.units.reduce((accumulator, currentUnit) => {
                        accumulator.push(currentUnit.id);

                        return accumulator;
                    }, [])
                    // units: currentSection.units
                });

                return accumulator;
            }, []));

            return accumulator;
        }, []),
        ...sorted_services.reduce((accumulator, currentService) => {
            accumulator.push(...currentService.sections.reduce((accumulator, currentSection) => {
                accumulator.push(...currentSection.units.reduce((accumulator, currentUnit) => {
                    accumulator.push({
                        officeType: 'unit',
                        officeID: currentUnit.id,
                        officeName: currentUnit.unitName,
                        officeAbbreviation: currentUnit.unitAbbreviation,
                        isServiceHead: false,
                        serviceID: currentService.id,
                        serviceName: currentService.serviceName,
                        sectionID: currentSection.id,
                        sectionName: currentSection.sectionName,
                        unitID: currentUnit.id,
                        unitName: currentUnit.unitName,
                        unitIDs: []
                    });

                    return accumulator;
                }, []));

                return accumulator;
            }, []));

            return accumulator;
        }, [])
    ]
    .sort((prev, next) => {
        return prev.officeName > next.officeName
            ? 1
            : ((prev.officeName < next.officeName)
                ? -1
                : 0);
    });

    // ! ----------------------------------------------------------------------------------------------------

    return {
        data: {
            // raw: data,
            services: sorted_services,
            service_names: service_names,
            section_names: section_names,
            unit_names: unit_names,
            office_names: office_names,
            service_ids: service_ids,
            section_ids: section_ids,
            unit_ids: unit_ids,
            office_ids: office_ids,
            office_map: office_map
        }
    };
});