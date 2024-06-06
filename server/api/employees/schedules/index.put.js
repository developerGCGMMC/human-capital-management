import { PrismaClient, Prisma } from '@prisma/client';
import moment from 'moment';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const { user_id, selected_employee_ids, calendar_settings } = await readBody(event);

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

            if(selected_employee_ids.length === 0) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Missing fields'
                });
            }

            const calendar_year_month = calendar_settings.year+'-'+calendar_settings.month+'-01';

            // ! ----------------------------------------------------------------------------------------------------

            const employee_schedules = await prisma.Employees.findMany({
                select: {
                    id: true,
                    employeeSchedules: {
                        select: {
                            id: true,
                            employeesID: true,
                            scheduleID: true,
                            scheduleDate: true,
                            schedules: {
                                select: {
                                    scheduleName: true,
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
                    }
                },
                where: {
                    id: {
                        in: selected_employee_ids
                    }
                }
            });

            const sorted_employees = employee_schedules.reduce((accumulator, currentEmployee) => {
                accumulator.push({
                    id: currentEmployee.id,
                    employeeSchedules: currentEmployee.employeeSchedules.sort((prev, next) => {
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
                    })
                });

                return accumulator;
            }, []);

            return sorted_employees;
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