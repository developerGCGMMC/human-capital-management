import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const search = getQuery(event);

    if(search.name || search.id) {
        const search_name = search.name ? search.name.replace(/[^a-zA-Z0-9]/g, ' | ') : null;
        const search_id = search.id ? search.id : null;

        const employees = await prisma.Employees.findMany({
            select: {
                lastName: true,
                firstName: true,
                middleName: true,
                genealogySuffix: true,
                appointmentStatus: true,
                employeeID: true,
                biometricsNo: true,
                activeStatus: true,

                gacsID: true,

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
                },

                employeeEmployment: {
                    select: {
                        position: true,
                        professionAcademicSuffix: true
                    }
                },
                employeeProfile: {
                    select: {
                        birthDate: true,
                        birthPlace: true,
                        gender: true,
                        civilStatus: true,
                        citizenship: true,
                        height: true,
                        weight: true,
                        bloodType: true
                    }
                },
                employeeAccounts: {
                    select: {
                        gsisID: true,
                        pagibigID: true,
                        philhealthNo: true,
                        sssNo: true,
                        tinNo: true
                    }
                },
                employeeContactAddress: {
                    select: {
                        mobileNo: true,
                        telephoneNo: true,
                        emailAddress: true,
                        residentialAddress: true,
                        residentialHouseNo: true,
                        residentialStreet: true,
                        residentialVillage: true,
                        residentialDistrict: true,
                        residentialMunicipality: true,
                        residentialProvince: true,
                        residentialZipCode: true,
                        permanentAddress: true,
                        permanentHouseNo: true,
                        permanentStreet: true,
                        permanentVillage: true,
                        permanentDistrict: true,
                        permanentMunicipality: true,
                        permanentProvince: true,
                        permanentZipCode: true
                    }
                },
                employeeSalary: {
                    select: {
                        salaryGrade: true,
                        salary: true,
                        step: true,
                        appointmentDate: true,
                        effectiveDate: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            },
            where: {
                ...(search_name
                    ? {
                        OR: [
                            {
                                lastName: {
                                    search: search_name
                                },
                                firstName: {
                                    search: search_name
                                },
                                middleName: {
                                    search: search_name
                                }
                            }
                        ]
                    }
                    : {}
                ),
                ...(search_id
                    ? {
                        OR: [
                            {
                                employeeID: {
                                    search: search_id
                                },
                                biometricsNo: {
                                    search: search_id
                                }
                            }
                        ]
                    }
                    : {}
                )
            }
        });

        const sorted_employees = employees.sort((prev, next) => {
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

        return {
            data: {
                employees: {
                    total: employees.length,
                    results: sorted_employees
                }
            }
        };
    }
});