import { PrismaClient, Prisma } from '@prisma/client';
import moment from 'moment';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const { user_id, selected_employee_ids, selected_dates, selected_schedule_ids, calendar_settings } = await readBody(event);

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

            if(selected_employee_ids.length === 0 || selected_dates.length === 0 || selected_schedule_ids.length === 0) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Missing fields'
                });
            }

            const calendar_year_month = calendar_settings.year+'-'+calendar_settings.month+'-01';

            let data = [];
            selected_employee_ids.forEach((selected_employee_id) => {
                selected_dates.forEach((selected_date) => {
                    selected_schedule_ids.forEach((selected_schedule_id) => {
                        data.push({
                            employeesID: selected_employee_id,
                            scheduleID: selected_schedule_id,
                            scheduleDate: selected_date
                        })
                    });
                });
            });

            // ! ----------------------------------------------------------------------------------------------------

            if(await prisma.EmployeeSchedules.createMany({
                data: data
            })) {
                return await prisma.Employees.findMany({
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
                                        scheduleName: true
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
            }
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