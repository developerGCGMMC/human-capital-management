import { PrismaClient, Prisma } from '@prisma/client';
import moment from 'moment';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const { user_id, selected_employee_ids, selected_dates, selected_schedule_ids, date_range } = await readBody(event);

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
                data: data,
                skipDuplicates: true
            })) {
                // return await prisma.Employees.findMany({
                //     select: {
                //         id: true,
                //         employeeSchedules: {
                //             select: {
                //                 id: true,
                //                 employeesID: true,
                //                 scheduleID: true,
                //                 scheduleDate: true,
                //                 schedules: {
                //                     select: {
                //                         scheduleName: true
                //                     }
                //                 }
                //             },
                //             where: {
                //                 scheduleDate: {
                                        // gte: date_range.from,
                                        // lte: date_range.to
                //                 }
                //             }
                //         }
                //     },
                //     where: {
                //         id: {
                //             in: selected_employee_ids
                //         }
                //     }
                // });

                const fetchEmployeeSchedules = prisma.EmployeeSchedules.findMany({
                    select: {
                        id: true,
                        employeesID: true,
                        scheduleID: true,
                        scheduleDate: true
                    },
                    where: {
                        employeesID: {
                            in: selected_employee_ids
                        },
                        scheduleDate: {
                            gte: date_range.from,
                            lte: date_range.to
                        }
                    }
                });
                const fetchSchedules = prisma.Schedules.findMany({
                    select: {
                        id: true,
                        scheduleName: true,
                        shortName: true,
                        scheduleLegend: true,
                        scheduleClass: true,
                        firstIn: true,
                        firstOut: true,
                        secondIn: true,
                        secondOut: true
                    }
                });

                const [fetched_employee_schedules, fetched_schedules] = await prisma.$transaction([fetchEmployeeSchedules, fetchSchedules]);

                const employee_schedules_schedules = fetched_employee_schedules.reduce((accumulator, currentEmployeeSchedule) => {
                    accumulator.push({
                        ...currentEmployeeSchedule,
                        schedules: fetched_schedules.reduce((accumulator, currentSchedule) => {
                            if(currentSchedule.id === currentEmployeeSchedule.scheduleID) {
                                accumulator = currentSchedule;
                            }

                            return accumulator;
                        }, {})
                    });

                    return accumulator;
                }, []).sort((prev, next) => {
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
                });

                // ! ----------------------------------------------------------------------------------------------------

                const employee_schedules = selected_employee_ids.reduce((accumulator, currentSelectedEmployeeID) => {
                    accumulator.push({
                        id: currentSelectedEmployeeID,
                        employeeSchedules: employee_schedules_schedules.reduce((accumulator, currentEmployeeSchedule) => {
                            if(currentEmployeeSchedule.employeesID === currentSelectedEmployeeID) {
                                accumulator.push(currentEmployeeSchedule);
                            }

                            return accumulator;
                        }, [])
                    });

                    return accumulator;
                }, []);

                const sorted_employees = employee_schedules.reduce((accumulator, currentEmployee) => {
                    accumulator.push({
                        id: currentEmployee.id,

                        groupedEmployeeSchedules: Object.entries(currentEmployee.employeeSchedules.reduce((accumulator, currentEmployeeSchedule) => {
                            (accumulator[moment(currentEmployeeSchedule.scheduleDate).format('YYYY-MM-DD')] = accumulator[moment(currentEmployeeSchedule.scheduleDate).format('YYYY-MM-DD')] || []).push({
                                id: currentEmployeeSchedule.id,
                                scheduleID: currentEmployeeSchedule.scheduleID,
                                scheduleName: currentEmployeeSchedule.schedules.scheduleName,
                                shortName: currentEmployeeSchedule.schedules.shortName,
                                scheduleLegend: currentEmployeeSchedule.schedules.scheduleLegend,
                                scheduleClass: currentEmployeeSchedule.schedules.scheduleClass
                            });

                            return accumulator;
                        }, {})).reduce((accumulator, currentEmployeeSchedule) => {
                            accumulator.push({
                                scheduleDate: currentEmployeeSchedule[0],
                                schedules: currentEmployeeSchedule[1]
                            });

                            return accumulator;
                        }, [])
                    });

                    return accumulator;
                }, []);

                // ! ----------------------------------------------------------------------------------------------------

                return sorted_employees;
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