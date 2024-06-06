import { PrismaClient, Prisma } from '@prisma/client';
import moment from 'moment';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const { user_id, selected_employee_id, calendar_year, calendar_month } = getQuery(event);

        try {
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

            if(!selected_employee_id.length || !calendar_year || !calendar_month) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Missing fields'
                });
            }

            const calendar_year_month = calendar_year+'-'+calendar_month+'-01';

            // ! ----------------------------------------------------------------------------------------------------

            // return {
            //     user_id: user_id, 
            //     selected_employee_id: selected_employee_id,
            //     calendar_year_month: calendar_year_month,
            //     admin_user: admin_user
            // }

            const employee_biometrics = await prisma.Employees.findUnique({
                select: {
                    id: true,
                    lastName: true,
                    firstName: true,
                    middleName: true,

                    employeeID: true,
                    biometricsNo: true,

                    employeeSchedules: {
                        select: {
                            scheduleDate: true,
                            schedules: {
                                select: {
                                    scheduleName: true,
                                    scheduleCategory: true,
                                    totalHours: true,
                                    firstHours: true,
                                    secondHours: true,
                                    firstIn: true,
                                    firstOut: true,
                                    secondIn: true,
                                    secondOut: true
                                }
                            }
                        },
                        where: {
                            scheduleDate: {
                                gte: moment(calendar_year_month).startOf('month').format('YYYY-MM-DD'),
                                lte: moment(calendar_year_month).endOf('month').format('YYYY-MM-DD')
                            }
                        }
                    },
                    biometricsInOut: {
                        select: {
                            checkTime: true,
                            checkType: true
                        },
                        where: {
                            checkTime: {
                                gte: moment(calendar_year_month).startOf('month').format('YYYY-MM-DD'),
                                lte: moment(calendar_year_month).endOf('month').format('YYYY-MM-DD')
                            }
                        }
                    }
                },
                where: {
                    id: selected_employee_id
                }
            });

            const sorted_employee_biometrics = {
                employeeID: employee_biometrics.employeeID,
                biometricsNo: employee_biometrics.biometricsNo,

                fullName: employee_biometrics.middleName
                    ? employee_biometrics.firstName+' '+(employee_biometrics.middleName).charAt(0)+'. '+employee_biometrics.lastName
                    : employee_biometrics.firstName+' '+employee_biometrics.lastName,
                displayName: employee_biometrics.lastName+', '+employee_biometrics.firstName,

                employeeSchedules: employee_biometrics.employeeSchedules.sort((prev, next) => {
                    return prev.scheduleDate > next.scheduleDate
                        ? 1
                        : (prev.scheduleDate < next.scheduleDate
                            ? -1
                            : (prev.schedules.firstIn > next.schedules.firstIn
                                ? 1
                                : (prev.schedules.firstIn < next.schedules.firstIn
                                    ? -1
                                    : (prev.schedules.firstOut > next.schedules.firstOut
                                        ? 1
                                        : (prev.schedules.firstOut < next.schedules.firstOut
                                            ? -1
                                            : (prev.schedules.secondIn > next.schedules.secondIn
                                                ? 1
                                                : (prev.schedules.secondIn < next.schedules.secondIn
                                                    ? -1
                                                    : (prev.schedules.secondOut > next.schedules.secondOut
                                                        ? 1
                                                        : (prev.schedules.secondOut < next.schedules.secondOut
                                                            ? -1
                                                            : 0)))))))));
                }),
                biometricsInOut: employee_biometrics.biometricsInOut.reduce((accumulator, currentBiometrics) => {
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
                        ? 1
                        : (prev.checkTime < next.checkTime
                            ? -1
                            : 0)
                }),
                settings: {
                    from: moment(calendar_year_month).startOf('month').format('YYYY-MM-DD'),
                    to: moment(calendar_year_month).endOf('month').format('YYYY-MM-DD')
                }
            };

            // ! ----------------------------------------------------------------------------------------------------

            sorted_employee_biometrics.groupedSchedules = Object.entries(sorted_employee_biometrics.employeeSchedules.reduce((accumulator, currentSchedule) => {
                (accumulator[moment(currentSchedule.scheduleDate).format('YYYY-MM-DD')] = accumulator[moment(currentSchedule.scheduleDate).format('YYYY-MM-DD')] || []).push({
                    scheduleDate: currentSchedule.scheduleDate,
                    schedules: currentSchedule.schedules
                });

                return accumulator;
            }, {})).reduce((accumulator, currentSchedule) => {
                accumulator.push({
                    scheduleDate: currentSchedule[0],
                    schedules: currentSchedule[1]
                });

                return accumulator;
            }, []);
            sorted_employee_biometrics.groupedBiometrics = Object.entries(sorted_employee_biometrics.biometricsInOut.reduce((accumulator, currentBiometric) => {
                (accumulator[moment(currentBiometric.checkTime).format('YYYY-MM-DD')] = accumulator[moment(currentBiometric.checkTime).format('YYYY-MM-DD')] || []).push({
                    checkTime: currentBiometric.checkTime,
                    checkType: currentBiometric.checkType
                });

                return accumulator;
            }, {})).reduce((accumulator, currentBiometric) => {
                accumulator.push({
                    checkDate: currentBiometric[0],
                    biometrics: currentBiometric[1]
                });

                return accumulator;
            }, []);

            // console.log(Object.entries(sorted_employee_biometrics.groupedSchedules));

            // ! ----------------------------------------------------------------------------------------------------

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