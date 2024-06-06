import { PrismaClient, Prisma } from '@prisma/client';
import moment from 'moment';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const search = getQuery(event);

        const year = (search.year && search.month) ? moment(search.year+'-'+search.month+'-01').format('YYYY') : moment().format('YYYY');
        const month = (search.month && search.month) ? moment(search.year+'-'+search.month+'-01').format('MM') : moment().format('MM');

        if(!search.no && !search.id || (year == 'Invalid date' || month == 'Invalid date')) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing / invalid fields'
            });
        }

        const biometrics_no = search.no ?? null;
        const employee_id = search.id ?? null;
        const year_month = year+'-'+month+'-01';
        const sort = search.sort === 'desc' ? 'desc' : 'asc';

        // return {
        //     biometrics_no: biometrics_no,
        //     employee_id: employee_id,
        //     year: year,
        //     month: month,
        //     sort: sort
        // }

        // ! ----------------------------------------------------------------------------------------------------

        try {
            const employee_biometrics = await prisma.Employees.findMany({
                select: {
                    id: true,
                    lastName: true,
                    firstName: true,
                    biometricsInOut: {
                        select: {
                            checkTime: true,
                            checkType: true
                        },
                        where: {
                            checkTime: {
                                gte: moment(year_month).startOf('month').format('YYYY-MM-DD'),
                                lte: moment(year_month).endOf('month').format('YYYY-MM-DD')
                            }
                        }
                    }
                },
                where: {
                    ...(biometrics_no
                        ? {
                            biometricsNo: biometrics_no
                        }
                        : {}
                    ),
                    ...(employee_id
                        ? {
                            employeeID: employee_id
                        }
                        : {}
                    )
                }
            });

            const sorted_employee_biometrics = employee_biometrics.reduce((accumulator, currentEmployeeBiometrics) => {
                accumulator.push({
                    id: currentEmployeeBiometrics.id,
                    fullName: currentEmployeeBiometrics.lastName+', '+currentEmployeeBiometrics.firstName,
                    biometricsInOut: currentEmployeeBiometrics.biometricsInOut.reduce((accumulator, currentBiometrics) => {
                        accumulator.push({
                            checkTime: currentBiometrics.checkTime,
                            checkType: currentBiometrics.checkType === 'I'
                                ? 'in'
                                : (currentBiometrics.checkType === 'O'
                                    ? 'out'
                                    : null)
                        });

                        return accumulator;
                    }, []).sort((prev, next) => {
                        return prev.checkTime > next.checkTime
                            ? sort === 'desc' ? -1 : 1
                            : (prev.checkTime < next.checkTime
                                ? sort === 'desc' ? 1 : -1
                                : 0)
                    })
                });

                return accumulator;
            }, []);

            return sorted_employee_biometrics;
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
    } catch(error) {
        console.error(error);

        return error;
    }
});