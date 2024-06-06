import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const services = await prisma.Services.findMany({
        select: {
            serviceName: true,
            sections: {
                select: {
                    sectionName: true,
                    units: {
                        select: {
                            unitName: true
                        }
                    }
                }
            }
        }
    });

    const offices = services.reduce((offices, service) => {
        offices.push({
            'service': service.serviceName,
            'sections': service.sections.reduce((sections, section) => {
                sections.push({
                    'section': section.sectionName,
                    'units': section.units.reduce((units, unit) => {
                        units.push(unit.unitName);

                        return units;
                    }, [])
                    .sort((prev, next) => {
                        return prev > next
                            ? 1
                            : ((prev < next)
                                ? -1
                                : 0)
                    })
                });

                return sections;
            }, [])
            .sort((prev, next) => {
                return prev.section > next.section
                    ? 1
                    : ((prev.section < next.section)
                        ? -1
                        : 0)
            })
        });

        return offices;
    }, [])
    .sort((prev, next) => {
        return prev.service > next.service
            ? 1
            : ((prev.service < next.service)
                ? -1
                : 0)
    });

    return {
        offices: offices
    };
});