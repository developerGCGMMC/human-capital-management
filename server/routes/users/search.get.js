import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const search = getQuery(event);

    if(search.name || search.id) {
        const search_name = search.name ? search.name.replace(/[^a-zA-Z0-9]/g, ' | ') : null;
        const search_id = search.id ? search.id : null;

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
            where: {
                ...(search_name
                    ? {
                        OR: [
                            {
                                employee: {
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
                            },
                            {
                                trainee: {
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
                            },
                            {
                                remoteWorker: {
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
                            },
                            {
                                agencyWorker: {
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
                            },
                        ]
                    }
                    : {}),
                ...(search_id
                    ? {
                        OR: [
                            {
                                employee: {
                                    employeeID: {
                                        search: search_id
                                    },
                                    biometricsNo: {
                                        search: search_id
                                    }
                                }
                            },
                            {
                                trainee: {
                                    traineeID: {
                                        search: search_id
                                    },
                                    biometricsNo: {
                                        search: search_id
                                    }
                                }
                            },
                            {
                                remoteWorker: {
                                    remoteWorkerID: {
                                        search: search_id
                                    },
                                    biometricsNo: {
                                        search: search_id
                                    }
                                }
                            },
                            {
                                agencyWorker: {
                                    agencyWorkerID: {
                                        search: search_id
                                    },
                                    biometricsNo: {
                                        search: search_id
                                    }
                                }
                            }
                        ]
                    }
                    : {})
            }
        });

        // ! ----------------------------------------------------------------------------------------------------

        const employees = users.reduce((employees, user) => {
            if(user.userType == 'employee') {
                employees.push(user);
            }

            return employees;
        }, [])
        .sort((prev, next) => {
            return prev.employee.lastName > next.employee.lastName
                ? 1
                : ((prev.employee.lastName < next.employee.lastName)
                    ? -1
                    : ((prev.employee.firstName > next.employee.firstName)
                        ? 1
                        : ((prev.employee.firstName < next.employee.firstName)
                            ? -1
                            : 0)))
        });

        const trainees = users.reduce((trainees, user) => {
            if(user.userType == 'trainee') {
                trainees.push(user);
            }

            return trainees;
        }, [])
        .sort((prev, next) => {
            return prev.trainee.lastName > next.trainee.lastName
                ? 1
                : ((prev.trainee.lastName < next.trainee.lastName)
                    ? -1
                    : ((prev.trainee.firstName > next.trainee.firstName)
                        ? 1
                        : ((prev.trainee.firstName < next.trainee.firstName)
                            ? -1
                            : 0)))
        });

        const remote_workers = users.reduce((remote_workers, user) => {
            if(user.userType == 'remote_worker') {
                remote_workers.push(user);
            }

            return remote_workers;
        }, [])
        .sort((prev, next) => {
            return prev.remoteWorker.lastName > next.remoteWorker.lastName
                ? 1
                : ((prev.remoteWorker.lastName < next.remoteWorker.lastName)
                    ? -1
                    : ((prev.remoteWorker.firstName > next.remoteWorker.firstName)
                        ? 1
                        : ((prev.remoteWorker.firstName < next.remoteWorker.firstName)
                            ? -1
                            : 0)))
        });

        const agency_workers = users.reduce((agency_workers, user) => {
            if(user.userType == 'agency_worker') {
                agency_workers.push(user);
            }

            return agency_workers;
        }, [])
        .sort((prev, next) => {
            return prev.agencyWorker.lastName > next.agencyWorker.lastName
                ? 1
                : ((prev.agencyWorker.lastName < next.agencyWorker.lastName)
                    ? -1
                    : ((prev.agencyWorker.firstName > next.agencyWorker.firstName)
                        ? 1
                        : ((prev.agencyWorker.firstName < next.agencyWorker.firstName)
                            ? -1
                            : 0)))
        });

        // ! ----------------------------------------------------------------------------------------------------

        return {
            data: {
                employees: {
                    total: employees.length,
                    results: employees
                },
                trainees: {
                    total: trainees.length,
                    results: trainees
                },
                remote_workers: {
                    total: remote_workers.length,
                    remote_workers: remote_workers
                },
                agency_workers: {
                    total: agency_workers.length,
                    agency_workers: agency_workers
                }
            }
        };
    }
});