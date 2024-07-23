import { PrismaClient, Prisma } from '@prisma/client';
import moment from 'moment';

const prisma = new PrismaClient();

const processData = async (employee_id, date_from, date_to, biometrics_no, fetched_schedules, schedule_range, time_display_format) => {
    // console.log('date_from: '+date_from+' | date_to: '+date_to+' | biometrics_no: '+biometrics_no);

    const fetchEmployeeSchedules = prisma.employeeSchedules.findMany({
        select: {
            employeesID: true,
            scheduleID: true,
            scheduleDate: true
        },
        where: {
            employeesID: employee_id,
            scheduleDate: {
                gte: date_from,
                lte: date_to
            }
        }
    });

    const fetchBiometricsInOut = prisma.BiometricsInOut.findMany({
        select: {
            checkTime: true,
            checkType: true
        },
        where: {
            biometricsNo: biometrics_no,
            checkTime: {
                gte: moment(date_from).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
                lte: moment(date_to).endOf('day').format('YYYY-MM-DD HH:mm:ss')
            }
        }
    });
    const fetchHolidays = prisma.Holidays.findMany({
        select: {
            holidayDate: true,
            holidayName: true,
            holidayType: true,
            holidayPeriod: true
        },
        where: {
            holidayDate: {
                gte: date_from,
                lte: date_to
            }
        }
    });

    const [fetched_employee_schedules, fetched_biometrics_in_out, fetched_holidays] = await prisma.$transaction([fetchEmployeeSchedules, fetchBiometricsInOut, fetchHolidays]);

    // ! ----------------------------------------------------------------------------------------------------

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

    const employee_biometrics = fetched_biometrics_in_out.reduce((accumulator, currentBiometrics) => {
        accumulator.push({
            checkTime: currentBiometrics.checkTime,
            checkType: currentBiometrics.checkType === 'I'
                ? 'in'
                : (currentBiometrics.checkType === 'O'
                    ? 'out'
                    : null)
        });

        return accumulator;
    }, [])
    .sort((prev, next) => {
        return prev.checkTime > next.checkTime
            ? 1
            : (prev.checkTime < next.checkTime
                ? -1
                : 0);
    });

    // ! ----------------------------------------------------------------------------------------------------

    const groupedSchedules = Object.entries(employee_schedules_schedules.reduce((accumulator, currentSchedule) => {
        (accumulator[moment(currentSchedule.scheduleDate).format('YYYY-MM-DD')] = accumulator[moment(currentSchedule.scheduleDate).format('YYYY-MM-DD')] || []).push({
            scheduleDate: currentSchedule.scheduleDate,
            schedules: currentSchedule.schedules
        });

        return accumulator;
    }, {}))
    .reduce((accumulator, currentSchedule) => {
        accumulator.push({
            scheduleDate: currentSchedule[0],
            schedules: currentSchedule[1]
        });

        return accumulator;
    }, []);
    const groupedBiometrics = Object.entries(employee_biometrics.reduce((accumulator, currentBiometric) => {
        (accumulator[moment(currentBiometric.checkTime).format('YYYY-MM-DD')] = accumulator[moment(currentBiometric.checkTime).format('YYYY-MM-DD')] || []).push({
            checkTime: currentBiometric.checkTime,
            checkType: currentBiometric.checkType
        });

        return accumulator;
    }, {}))
    .reduce((accumulator, currentBiometric) => {
        accumulator.push({
            checkDate: currentBiometric[0],
            biometrics: currentBiometric[1]
        });

        return accumulator;
    }, []);

    const groupedHolidays = Object.entries(fetched_holidays.sort((prev, next) => {
        return prev.holidayDate > next.holidayDate
            ? 1
            : (prev.holidayDate < next.holidayDate
                ? -1
                : 0
            );
    })
    .reduce((accumulator, currentHoliday) => {
        (accumulator[moment(currentHoliday.holidayDate).format('YYYY-MM-DD')] = accumulator[moment(currentHoliday.holidayDate).format('YYYY-MM-DD')] || []).push({
            holidayDate: currentHoliday.holidayDate,
            holidayName: currentHoliday.holidayName,
            holidayType: currentHoliday.holidayType,
            holidayPeriod: currentHoliday.holidayPeriod
        });

        return accumulator;
    }, {}))
    .reduce((accumulator, currentHoliday) => {
        accumulator.push({
            holidayDate: currentHoliday[0],
            holidays: currentHoliday[1]
        });

        return accumulator;
    }, []);

    // ! ----------------------------------------------------------------------------------------------------

    const scheduleComputations = Object.entries(employee_schedules_schedules.reduce((accumulator, currentEmployeeSchedule) => {
        (accumulator[moment(currentEmployeeSchedule.scheduleDate).format('YYYY-MM-DD')] = accumulator[moment(currentEmployeeSchedule.scheduleDate).format('YYYY-MM-DD')] || []).push({
            scheduleDate: currentEmployeeSchedule.scheduleDate,
            schedules: currentEmployeeSchedule.schedules
        });

        return accumulator;
    }, {}))
    .reduce((accumulator, currentSchedule) => {
        accumulator.push({
            scheduleDate: currentSchedule[0],
            scheduleBiometrics: currentSchedule[1].reduce((accumulator, currentSchedule) => {

                let inOuts = null;
                if(currentSchedule.schedules.scheduleCategory === 'oneBreak') {
                    inOuts = {
                        firstIn: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).format('YYYY-MM-DD HH:mm:ss'),
                        firstOut: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).format('YYYY-MM-DD HH:mm:ss'),
                        secondIn: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.secondIn).format('YYYY-MM-DD HH:mm:ss'),
                        secondOut: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.secondOut).format('YYYY-MM-DD HH:mm:ss')
                    };
                } else if(currentSchedule.schedules.scheduleCategory === 'toMidnight') {
                    inOuts = {
                        firstIn: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).format('YYYY-MM-DD HH:mm:ss'),
                        firstOut: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).add(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
                    };
                } else if(currentSchedule.schedules.scheduleCategory === 'twoDays') {
                    inOuts = {
                        firstIn: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).format('YYYY-MM-DD HH:mm:ss'),
                        firstOut: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).add(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
                    };
                } else {
                    inOuts = {
                        firstIn: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).format('YYYY-MM-DD HH:mm:ss'),
                        firstOut: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).format('YYYY-MM-DD HH:mm:ss')
                    };
                }

                // ! ----------------------------------------------------------------------------------------------------

                let scheduleRange = null;
                if(currentSchedule.schedules.scheduleCategory === 'oneBreak') {
                    scheduleRange = {
                        firstIn: {
                            from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).subtract(schedule_range.range_value, schedule_range.range_type).format('YYYY-MM-DD HH:mm:ss'),
                            to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).subtract(schedule_range.range_value, schedule_range.range_type).format('YYYY-MM-DD HH:mm:ss')
                        },
                        firstOut: {
                            from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).add(schedule_range.range_value, schedule_range.range_type).format('YYYY-MM-DD HH:mm:ss'),
                            to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.secondIn).format('YYYY-MM-DD HH:mm:ss')
                        },
                        secondIn: {
                            from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).format('YYYY-MM-DD HH:mm:ss'),
                            to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.secondOut).subtract(schedule_range.range_value, schedule_range.range_type).format('YYYY-MM-DD HH:mm:ss')
                        },
                        secondOut: {
                            from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.secondIn).add(schedule_range.range_value, schedule_range.range_type).format('YYYY-MM-DD HH:mm:ss'),
                            to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.secondOut).add(schedule_range.range_value, schedule_range.range_type).format('YYYY-MM-DD HH:mm:ss')
                        }
                    };
                } else if(currentSchedule.schedules.scheduleCategory === 'toMidnight') {
                    scheduleRange = {
                        firstIn: {
                            from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).subtract(schedule_range.range_value, schedule_range.range_type).format('YYYY-MM-DD HH:mm:ss'),
                            to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).add(1, 'days').subtract(schedule_range.range_value, schedule_range.range_type).format('YYYY-MM-DD HH:mm:ss')
                        },
                        firstOut: {
                            from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).add(schedule_range.range_value, schedule_range.range_type).format('YYYY-MM-DD HH:mm:ss'),
                            to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).add(1, 'days').add(schedule_range.range_value, schedule_range.range_type).format('YYYY-MM-DD HH:mm:ss')
                        }
                    };
                } else if(currentSchedule.schedules.scheduleCategory === 'twoDays') {
                    scheduleRange = {
                        firstIn: {
                            from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).subtract(schedule_range.range_value, schedule_range.range_type).format('YYYY-MM-DD HH:mm:ss'),
                            to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).add(1, 'days').subtract(schedule_range.range_value, schedule_range.range_type).format('YYYY-MM-DD HH:mm:ss')
                        },
                        firstOut: {
                            from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).add(schedule_range.range_value, schedule_range.range_type).format('YYYY-MM-DD HH:mm:ss'),
                            to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).add(1, 'days').add(schedule_range.range_value, schedule_range.range_type).format('YYYY-MM-DD HH:mm:ss')
                        }
                    };
                } else {
                    scheduleRange = {
                        firstIn: {
                            from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).subtract(schedule_range.range_value, schedule_range.range_type).format('YYYY-MM-DD HH:mm:ss'),
                            to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).subtract(schedule_range.range_value, schedule_range.range_type).format('YYYY-MM-DD HH:mm:ss')
                        },
                        firstOut: {
                            from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).add(schedule_range.range_value, schedule_range.range_type).format('YYYY-MM-DD HH:mm:ss'),
                            to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).add(schedule_range.range_value, schedule_range.range_type).format('YYYY-MM-DD HH:mm:ss')
                        }
                    };
                }

                // ! ----------------------------------------------------------------------------------------------------

                let biometricCapture = null;
                if(currentSchedule.schedules.scheduleCategory === 'oneBreak') {
                    biometricCapture = {
                        firstIn: employee_biometrics.reduce((accumulator, currentBiometric) => {
                            if(moment(currentBiometric.checkTime).isBetween(moment(scheduleRange.firstIn.from), moment(scheduleRange.firstIn.to), undefined, []) === true
                                && currentBiometric.checkType === 'in') {
                                accumulator = currentBiometric;
                            }

                            return accumulator;
                        }, { checkTime: null, checkType: null }),
                        firstOut: employee_biometrics.reduce((accumulator, currentBiometric) => {
                            if(moment(currentBiometric.checkTime).isBetween(moment(scheduleRange.firstOut.from), moment(scheduleRange.firstOut.to), undefined, []) === true
                                && currentBiometric.checkType === 'out') {
                                accumulator = currentBiometric;
                            }

                            return accumulator;
                        }, { checkTime: null, checkType: null }),
                        secondIn: employee_biometrics.reduce((accumulator, currentBiometric) => {
                            if(moment(currentBiometric.checkTime).isBetween(moment(scheduleRange.secondIn.from), moment(scheduleRange.secondIn.to), undefined, []) === true
                                && currentBiometric.checkType === 'in') {
                                accumulator = currentBiometric;
                            }

                            return accumulator;
                        }, { checkTime: null, checkType: null }),
                        secondOut: employee_biometrics.reduce((accumulator, currentBiometric) => {
                            if(moment(currentBiometric.checkTime).isBetween(moment(scheduleRange.secondOut.from), moment(scheduleRange.secondOut.to), undefined, []) === true
                                && currentBiometric.checkType === 'out') {
                                accumulator = currentBiometric;
                            }

                            return accumulator;
                        }, { checkTime: null, checkType: null })
                    };
                } else {
                    biometricCapture = {
                        firstIn: employee_biometrics.reduce((accumulator, currentBiometric) => {
                            if(moment(currentBiometric.checkTime).isBetween(moment(scheduleRange.firstIn.from), moment(scheduleRange.firstIn.to), undefined, []) === true
                                && currentBiometric.checkType === 'in') {
                                accumulator = currentBiometric;
                            }

                            return accumulator;
                        }, { checkTime: null, checkType: null }),
                        firstOut: employee_biometrics.reduce((accumulator, currentBiometric) => {
                            if(moment(currentBiometric.checkTime).isBetween(moment(scheduleRange.firstOut.from), moment(scheduleRange.firstOut.to), undefined, []) === true
                                && currentBiometric.checkType === 'out') {
                                accumulator = currentBiometric;
                            }

                            return accumulator;
                        }, { checkTime: null, checkType: null })
                    };
                }

                // ! ----------------------------------------------------------------------------------------------------

                let undertimeComputations = null;
                if(currentSchedule.schedules.scheduleCategory === 'oneBreak') {
                    const firstIn = moment(biometricCapture.firstIn.checkTime).isSameOrAfter(moment(inOuts.firstIn), 'minutes')
                        ? moment(biometricCapture.firstIn.checkTime).diff(moment(inOuts.firstIn), 'minutes')
                        : 0;
                    const firstOut = moment(biometricCapture.firstOut.checkTime).isSameOrBefore(moment(inOuts.firstOut), 'minutes')
                        ? moment(inOuts.firstOut).diff(moment(biometricCapture.firstOut.checkTime), 'minutes')
                        : 0;
                    const secondIn = moment(biometricCapture.secondIn.checkTime).isSameOrAfter(moment(inOuts.secondIn), 'minutes')
                        ? moment(biometricCapture.secondIn.checkTime).diff(moment(inOuts.secondIn), 'minutes')
                        : 0;
                    const secondOut = moment(biometricCapture.secondOut.checkTime).isSameOrBefore(moment(inOuts.secondOut), 'minutes')
                        ? moment(inOuts.secondOut).diff(moment(biometricCapture.secondOut.checkTime), 'minutes')
                        : 0;
                    const totalMinutes = (biometricCapture.firstIn.checkTime && biometricCapture.firstOut.checkTime
                        ? parseInt(firstIn + firstOut)
                        : parseInt(currentSchedule.schedules.firstHours) * 60)
                        + (biometricCapture.secondIn.checkTime && biometricCapture.secondOut.checkTime
                        ? parseInt(secondIn + secondOut)
                        : parseInt(currentSchedule.schedules.secondHours) * 60);

                    undertimeComputations = {
                        inOuts: {
                            firstIn: biometricCapture.firstIn.checkTime
                                ? firstIn
                                : null,
                            firstOut: biometricCapture.firstOut.checkTime
                                ? firstOut
                                : null,
                            firstTotal: (biometricCapture.firstIn.checkTime && biometricCapture.firstOut.checkTime)
                                ? parseInt(firstIn + firstOut)
                                : parseInt(currentSchedule.schedules.firstHours) * 60,

                            secondIn: biometricCapture.secondIn.checkTime
                                ? secondIn
                                : null,
                            secondOut: biometricCapture.secondOut.checkTime
                                ? secondOut
                                : null,
                            secondTotal: (biometricCapture.secondIn.checkTime && biometricCapture.secondOut.checkTime)
                                ? parseInt(secondIn + secondOut)
                                : parseInt(currentSchedule.schedules.secondHours) * 60
                        },
                        totalMinutes: totalMinutes
                    };
                } else {
                    const firstIn = moment(biometricCapture.firstIn.checkTime).isSameOrAfter(moment(inOuts.firstIn), 'minutes')
                        ? moment(biometricCapture.firstIn.checkTime).diff(moment(inOuts.firstIn), 'minutes')
                        : 0;
                    const firstOut = moment(biometricCapture.firstOut.checkTime).isSameOrBefore(moment(inOuts.firstOut), 'minutes')
                        ? moment(inOuts.firstOut).diff(moment(biometricCapture.firstOut.checkTime), 'minutes')
                        : 0;
                    const totalMinutes = (biometricCapture.firstIn.checkTime && biometricCapture.firstOut.checkTime
                        ? parseInt(firstIn + firstOut)
                        : parseInt(currentSchedule.schedules.totalHours) * 60);

                    undertimeComputations = {
                        inOuts: {
                            firstIn: biometricCapture.firstIn.checkTime
                                ? firstIn
                                : null,
                            firstOut: biometricCapture.firstOut.checkTime
                                ? firstOut
                                : null,
                            firstTotal: (biometricCapture.firstIn.checkTime && biometricCapture.firstOut.checkTime)
                                ? parseInt(firstIn + firstOut)
                                : parseInt(currentSchedule.schedules.totalHours) * 60
                        },
                        totalMinutes: totalMinutes
                    };
                }

                // ! ----------------------------------------------------------------------------------------------------

                let scheduleSlots = null;
                if(currentSchedule.schedules.scheduleCategory === 'fromMidnight') {
                    scheduleSlots = {
                        dayNo: '('+moment(currentSchedule.scheduleDate).subtract(1, 'days').format('D')+')-'+moment(currentSchedule.scheduleDate).format('D'),
                        firstDay: {
                            am: {
                                in: null,
                                out: null
                            },
                            pm: {
                                in: (biometricCapture.firstIn.checkTime && biometricCapture.firstIn.checkType === 'in'
                                    && moment(biometricCapture.firstIn.checkTime).format('YYYY-MM-DD') === moment(currentSchedule.scheduleDate).subtract(1, 'days').format('YYYY-MM-DD')
                                    && moment(biometricCapture.firstIn.checkTime).format('a') === 'pm')
                                    ? moment(biometricCapture.firstIn.checkTime).format(time_display_format)
                                    : null,
                                out: null
                            }
                        },
                        secondDay: {
                            am: {
                                in: (biometricCapture.firstIn.checkTime && biometricCapture.firstIn.checkType === 'in'
                                    && moment(biometricCapture.firstIn.checkTime).format('YYYY-MM-DD') === moment(currentSchedule.scheduleDate).format('YYYY-MM-DD')
                                    && moment(biometricCapture.firstIn.checkTime).format('a') === 'am')
                                    ? moment(biometricCapture.firstIn.checkTime).format(time_display_format)
                                    : null,
                                out: (biometricCapture.firstOut.checkTime && biometricCapture.firstOut.checkType === 'out'
                                    && moment(biometricCapture.firstOut.checkTime).format('YYYY-MM-DD') === moment(currentSchedule.scheduleDate).format('YYYY-MM-DD')
                                    && moment(biometricCapture.firstOut.checkTime).format('a') === 'am')
                                    ? moment(biometricCapture.firstOut.checkTime).format(time_display_format)
                                    : null
                            },
                            pm: {
                                in: null,
                                out: null
                            }
                        },
                        undertime: {
                            hours: (undertimeComputations.totalMinutes > 0)
                                ? String(Math.trunc(parseInt(undertimeComputations.totalMinutes) / 60))
                                : null,
                            minutes: (undertimeComputations.totalMinutes > 0)
                                ? String(parseInt(undertimeComputations.totalMinutes) % 60)
                                : null
                        }
                    };
                }
                if(currentSchedule.schedules.scheduleCategory === 'noBreak') {
                    scheduleSlots = {
                        dayNo: moment(currentSchedule.scheduleDate).format('D'),
                        firstDay: {
                            am: {
                                in: (biometricCapture.firstIn.checkTime
                                    && moment(biometricCapture.firstIn.checkTime).format('a') === 'am')
                                    ? moment(biometricCapture.firstIn.checkTime).format(time_display_format)
                                    : null,
                                out: (biometricCapture.firstOut.checkTime
                                    && moment(biometricCapture.firstOut.checkTime).format('a') === 'am')
                                    ? moment(biometricCapture.firstOut.checkTime).format(time_display_format)
                                    : null
                            },
                            pm: {
                                in: (biometricCapture.firstIn.checkTime
                                    && moment(biometricCapture.firstIn.checkTime).format('a') === 'pm')
                                    ? moment(biometricCapture.firstIn.checkTime).format(time_display_format)
                                    : null,
                                out: (biometricCapture.firstOut.checkTime
                                    && moment(biometricCapture.firstOut.checkTime).format('a') === 'pm')
                                    ? moment(biometricCapture.firstOut.checkTime).format(time_display_format)
                                    : null
                            }
                        },
                        undertime: {
                            hours: (undertimeComputations.totalMinutes > 0)
                                ? String(Math.trunc(parseInt(undertimeComputations.totalMinutes) / 60))
                                : null,
                            minutes: (undertimeComputations.totalMinutes > 0)
                                ? String(parseInt(undertimeComputations.totalMinutes) % 60)
                                : null
                        }
                    };
                }
                if(currentSchedule.schedules.scheduleCategory === 'oneBreak') {
                    scheduleSlots = {
                        dayNo: moment(currentSchedule.scheduleDate).format('D'),
                        firstDay: {
                            am: {
                                in: biometricCapture.firstIn.checkTime
                                    ? moment(biometricCapture.firstIn.checkTime).format(time_display_format)
                                    : null,
                                out: biometricCapture.firstOut.checkTime
                                    ? moment(biometricCapture.firstOut.checkTime).format(time_display_format)
                                    : null
                            },
                            pm: {
                                in: biometricCapture.secondIn.checkTime
                                    ? moment(biometricCapture.secondIn.checkTime).format(time_display_format)
                                    : null,
                                out: biometricCapture.secondOut.checkTime
                                    ? moment(biometricCapture.secondOut.checkTime).format(time_display_format)
                                    : null
                            }
                        },
                        undertime: {
                            hours: (undertimeComputations.totalMinutes > 0)
                                ? String(Math.trunc(parseInt(undertimeComputations.totalMinutes) / 60))
                                : null,
                            minutes: (undertimeComputations.totalMinutes > 0)
                                ? String(parseInt(undertimeComputations.totalMinutes) % 60)
                                : null
                        }
                    };
                }
                if(currentSchedule.schedules.scheduleCategory === 'toMidnight') {
                    scheduleSlots = {
                        dayNo: moment(currentSchedule.scheduleDate).format('D')+'-('+moment(currentSchedule.scheduleDate).add(1, 'days').format('D')+')',
                        firstDay: {
                            am: {
                                in: null,
                                out: null
                            },
                            pm: {
                                in: (biometricCapture.firstIn.checkTime && biometricCapture.firstIn.checkType === 'in'
                                    && moment(biometricCapture.firstIn.checkTime).format('YYYY-MM-DD') === moment(currentSchedule.scheduleDate).format('YYYY-MM-DD')
                                    && moment(biometricCapture.firstIn.checkTime).format('a') === 'pm')
                                    ? moment(biometricCapture.firstIn.checkTime).format(time_display_format)
                                    : null,
                                out: (biometricCapture.firstOut.checkTime && biometricCapture.firstOut.checkType === 'out'
                                    && moment(biometricCapture.firstOut.checkTime).format('YYYY-MM-DD') === moment(currentSchedule.scheduleDate).format('YYYY-MM-DD')
                                    && moment(biometricCapture.firstOut.checkTime).format('a') === 'pm')
                                    ? moment(biometricCapture.firstOut.checkTime).format(time_display_format)
                                    : null
                            }
                        },
                        secondDay: {
                            am: {
                                in: null,
                                out: (biometricCapture.firstOut.checkTime && biometricCapture.firstOut.checkType === 'out'
                                    && moment(biometricCapture.firstOut.checkTime).format('YYYY-MM-DD') === moment(currentSchedule.scheduleDate).add(1, 'days').format('YYYY-MM-DD')
                                    && moment(biometricCapture.firstOut.checkTime).format('a') === 'am')
                                    ? moment(biometricCapture.firstOut.checkTime).format(time_display_format)
                                    : null
                            },
                            pm: {
                                in: null,
                                out: null
                            }
                        },
                        undertime: {
                            hours: (undertimeComputations.totalMinutes > 0)
                                ? String(Math.trunc(parseInt(undertimeComputations.totalMinutes) / 60))
                                : null,
                            minutes: (undertimeComputations.totalMinutes > 0)
                                ? String(parseInt(undertimeComputations.totalMinutes) % 60)
                                : null
                        }
                    };
                }
                if(currentSchedule.schedules.scheduleCategory === 'twoDays') {
                    scheduleSlots = {
                        dayNo: moment(currentSchedule.scheduleDate).format('D')+'-'+moment(currentSchedule.scheduleDate).add(1, 'days').format('D'),
                        firstDay: {
                            am: {
                                in: null,
                                out: null
                            },
                            pm: {
                                in: (biometricCapture.firstIn.checkTime && biometricCapture.firstIn.checkType === 'in'
                                    && moment(biometricCapture.firstIn.checkTime).format('YYYY-MM-DD') === moment(currentSchedule.scheduleDate).format('YYYY-MM-DD')
                                    && moment(biometricCapture.firstIn.checkTime).format('a') === 'pm')
                                    ? moment(biometricCapture.firstIn.checkTime).format(time_display_format)
                                    : null,
                                out: (biometricCapture.firstOut.checkTime && biometricCapture.firstOut.checkType === 'out'
                                    && moment(biometricCapture.firstOut.checkTime).format('YYYY-MM-DD') === moment(currentSchedule.scheduleDate).format('YYYY-MM-DD')
                                    && moment(biometricCapture.firstOut.checkTime).format('a') === 'pm')
                                    ? moment(biometricCapture.firstOut.checkTime).format(time_display_format)
                                    : null
                            }
                        },
                        secondDay: {
                            am: {
                                in: (biometricCapture.firstIn.checkTime && biometricCapture.firstIn.checkType === 'in'
                                    && moment(biometricCapture.firstIn.checkTime).format('YYYY-MM-DD') === moment(currentSchedule.scheduleDate).add(1, 'days').format('YYYY-MM-DD')
                                    && moment(biometricCapture.firstIn.checkTime).format('a') === 'am')
                                    ? moment(biometricCapture.firstIn.checkTime).format(time_display_format)
                                    : null,
                                out: (biometricCapture.firstOut.checkTime && biometricCapture.firstOut.checkType === 'out'
                                    && moment(biometricCapture.firstOut.checkTime).format('YYYY-MM-DD') === moment(currentSchedule.scheduleDate).add(1, 'days').format('YYYY-MM-DD')
                                    && moment(biometricCapture.firstOut.checkTime).format('a') === 'am')
                                    ? moment(biometricCapture.firstOut.checkTime).format(time_display_format)
                                    : null
                            },
                            pm: {
                                in: null,
                                out: null
                            }
                        },
                        undertime: {
                            hours: (undertimeComputations.totalMinutes > 0)
                                ? String(Math.trunc(parseInt(undertimeComputations.totalMinutes) / 60))
                                : null,
                            minutes: (undertimeComputations.totalMinutes > 0)
                                ? String(parseInt(undertimeComputations.totalMinutes) % 60)
                                : null
                        }
                    };
                }

                // ! ----------------------------------------------------------------------------------------------------

                accumulator.push({
                    scheduleName: currentSchedule.schedules.scheduleName,
                    scheduleCategory: currentSchedule.schedules.scheduleCategory,
                    totalHours: currentSchedule.schedules.totalHours,
                    firstHours:currentSchedule.schedules.firstHours,
                    secondHours: currentSchedule.schedules.secondHours,

                    inOuts: inOuts,
                    scheduleRange: scheduleRange,
                    biometricCapture: biometricCapture,
                    undertimeComputations: undertimeComputations,
                    scheduleSlots: scheduleSlots
                });

                return accumulator;
            }, [])
        });

        return accumulator;
    }, []);

    // ! ----------------------------------------------------------------------------------------------------

    const scheduleDates = scheduleComputations.reduce((accumulator, currentScheduleComputation) => {
        accumulator.push(currentScheduleComputation.scheduleDate);

        return accumulator;
    }, []);
    const holidayDates = groupedHolidays.reduce((accumulator, currentGroupedHoliday) => {
        accumulator.push(currentGroupedHoliday.holidayDate);

        return accumulator;
    }, []);

    // ! ----------------------------------------------------------------------------------------------------

    let date_minuend = moment(date_to);
    let date_subtrahend = moment(date_from);
    let date_difference = date_minuend.diff(date_subtrahend, 'days');
    // console.log('date_difference: '+date_difference);

    let dtrDates = [];
    for(let x = 0; x < (date_difference + 1); x++) {
        dtrDates.push(moment(date_from).add(x, 'days').format('YYYY-MM-DD'));
    }
    // console.log('dtrDates: '+JSON.stringify(dtrDates));

    // ! ----------------------------------------------------------------------------------------------------

    const previewBody = dtrDates.reduce((accumulator, currentDate) => {
        if(scheduleDates.includes(currentDate)) {
            accumulator.push({
                dayDate: currentDate,
                dayType: 'schedule',
                daySlots: scheduleComputations.reduce((accumulator, currentScheduleComputation) => {
                    if(currentScheduleComputation.scheduleDate === currentDate) {
                        accumulator = currentScheduleComputation.scheduleBiometrics;
                    }

                    return accumulator;
                }, [])
            });
        } else {
            if(holidayDates.includes(currentDate)) {
                accumulator.push({
                    dayDate: currentDate,
                    dayType: 'holiday',
                    dayName: groupedHolidays.reduce((accumulator, currentGroupedHoliday) => {
                        if(currentDate === currentGroupedHoliday.holidayDate) {
                            accumulator = currentGroupedHoliday.holidays.reduce((accumulator, currentHoliday) => {
                                if(currentGroupedHoliday.holidayDate === currentHoliday.holidayDate) {
                                    accumulator = currentHoliday.holidayName;
                                }
                                return accumulator;
                            }, null);
                        }

                        return accumulator;
                    }, null)
                });
            } else {
                accumulator.push({
                    dayDate: currentDate,
                    dayType: 'day',
                    dayName: (moment(currentDate).format('dddd') === 'Saturday' || moment(currentDate).format('dddd') === 'Sunday')
                        ? moment(currentDate).format('dddd')
                        : 'Off'
                });
            }
        }

        return accumulator;
    }, []);

    const pdfBody = dtrDates.reduce((accumulator, currentDate) => {
        if(scheduleDates.includes(currentDate)) {
            accumulator.push(...scheduleComputations.reduce((accumulator, currentScheduleComputation) => {
                if(currentScheduleComputation.scheduleDate === currentDate) {
                    accumulator.push(...currentScheduleComputation.scheduleBiometrics.reduce((accumulator, currentScheduleBiometric) => {
                        if(currentScheduleBiometric.scheduleCategory === 'fromMidnight') {
                            accumulator.push([
                                { content: currentScheduleBiometric.scheduleSlots.dayNo, rowSpan: 2 },
                                null,
                                null,
                                currentScheduleBiometric.scheduleSlots.firstDay.pm.in ?? '',
                                null,
                                { content: currentScheduleBiometric.scheduleSlots.undertime.hours ?? '', rowSpan: 2 },
                                { content: currentScheduleBiometric.scheduleSlots.undertime.minutes ?? '', rowSpan: 2 }
                            ]);
                            accumulator.push([
                                currentScheduleBiometric.scheduleSlots.secondDay.am.in,
                                currentScheduleBiometric.scheduleSlots.secondDay.am.out,
                                null,
                                null
                            ]);
                        } else if(currentScheduleBiometric.scheduleCategory === 'oneBreak' || currentScheduleBiometric.scheduleCategory === 'noBreak') {
                            accumulator.push([
                                currentScheduleBiometric.scheduleSlots.dayNo,
                                currentScheduleBiometric.scheduleSlots.firstDay.am.in ?? '',
                                currentScheduleBiometric.scheduleSlots.firstDay.am.out ?? '',
                                currentScheduleBiometric.scheduleSlots.firstDay.pm.in ?? '',
                                currentScheduleBiometric.scheduleSlots.firstDay.pm.out ?? '',
                                currentScheduleBiometric.scheduleSlots.undertime.hours ?? '',
                                currentScheduleBiometric.scheduleSlots.undertime.minutes ?? ''
                            ]);
                        } else if(currentScheduleBiometric.scheduleCategory === 'toMidnight') {
                            accumulator.push([
                                { content: currentScheduleBiometric.scheduleSlots.dayNo, rowSpan: 2 },
                                null,
                                null,
                                currentScheduleBiometric.scheduleSlots.firstDay.pm.in ?? '',
                                currentScheduleBiometric.scheduleSlots.firstDay.pm.out ?? '',
                                { content: currentScheduleBiometric.scheduleSlots.undertime.hours ?? '', rowSpan: 2 },
                                { content: currentScheduleBiometric.scheduleSlots.undertime.minutes ?? '', rowSpan: 2 }
                            ]);
                            accumulator.push([
                                null,
                                currentScheduleBiometric.scheduleSlots.secondDay.am.out ?? '',
                                null,
                                null
                            ]);
                        } else if(currentScheduleBiometric.scheduleCategory === 'twoDays'){
                            accumulator.push([
                                { content: currentScheduleBiometric.scheduleSlots.dayNo, rowSpan: 2 },
                                null,
                                null,
                                currentScheduleBiometric.scheduleSlots.firstDay.pm.in ?? '',
                                currentScheduleBiometric.scheduleSlots.firstDay.pm.out ?? '',
                                { content: currentScheduleBiometric.scheduleSlots.undertime.hours ?? '', rowSpan: 2 },
                                { content: currentScheduleBiometric.scheduleSlots.undertime.minutes ?? '', rowSpan: 2 }
                            ]);
                            accumulator.push([
                                currentScheduleBiometric.scheduleSlots.secondDay.am.in ?? '',
                                currentScheduleBiometric.scheduleSlots.secondDay.am.out ?? '',
                                null,
                                null
                            ]);
                        } else {
                            accumulator.push([
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null
                            ]);
                        }

                        return accumulator;
                    }, []));
                }

                return accumulator;
            }, []));
        } else {
            if(holidayDates.includes(currentDate)) {
                accumulator.push([
                    moment(currentDate).format('D'),
                    { content: groupedHolidays.reduce((accumulator, currentGroupedHoliday) => {
                            if(currentDate === currentGroupedHoliday.holidayDate) {
                                accumulator = currentGroupedHoliday.holidays.reduce((accumulator, currentHoliday) => {
                                    if(currentGroupedHoliday.holidayDate === currentHoliday.holidayDate) {
                                        accumulator = currentHoliday.holidayName;
                                    }
                                    return accumulator;
                                }, null);
                            }

                            return accumulator;
                        }, null), colSpan: 4 },
                    { content: '', colSpan: 2 }
                ]);
            } else {
                const date_name = moment(currentDate).format('dddd');
                if(date_name === 'Saturday' || date_name === 'Sunday') {
                    accumulator.push([
                        moment(currentDate).format('D'),
                        { content: date_name, colSpan: 4 },
                        { content: '', colSpan: 2 }
                    ]);
                } else {
                    accumulator.push([
                        moment(currentDate).format('D'),
                        { content: 'Off', colSpan: 4 },
                        { content: '', colSpan: 2 }
                    ]);
                }
            }
        }

        return accumulator;
    }, []);

    // ! ----------------------------------------------------------------------------------------------------

    return {
        groupedSchedules,
        groupedBiometrics,
        groupedHolidays,

        scheduleComputations,

        previewBody,
        pdfBody
    }
};

export default defineEventHandler(async (event) => {
    try {
        const { fetch_by, user_id, selected_employee_id, date_from, date_to, range_group='whole' } = getQuery(event);

        if(!user_id || !date_from || !date_to) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing fields'
            });
        }

        try {
            const user_auth = await prisma.Users.findUnique({
                select: {
                    employeeID: true
                },
                where: {
                    id: user_id
                }
            });

            if(!user_auth.employeeID) {
                throw createError({
                    statusCode: 401,
                    statusMessage: 'Unauthorized'
                });
            }

            // ! ----------------------------------------------------------------------------------------------------

            const employee_id = fetch_by === 'employee' ? selected_employee_id : user_auth.employeeID;

            // ! ----------------------------------------------------------------------------------------------------

            // ! CHANGE THIS!
            const time_display_format = 'h:mm';
            const schedule_range = {
                range_value: 2,
                range_type: 'hours'
            };

            // ! ----------------------------------------------------------------------------------------------------

            const fetchEmployee = prisma.Employees.findUnique({
                select: {
                    id: true,
                    lastName: true,
                    firstName: true,
                    middleName: true,
                    employeeID: true,
                    biometricsNo: true,

                    serviceID: true,
                    sectionID: true,
                    unitID: true
                },
                where: {
                    id: employee_id
                }
            });
            const fetchSchedules = prisma.Schedules.findMany({
                select: {
                    id: true,
                    scheduleName: true,
                    scheduleCategory: true,
                    shortName: true,
                    scheduleLegend: true,
                    scheduleClass: true,
                    totalHours: true,
                    firstHours: true,
                    secondHours: true,
                    firstIn: true,
                    firstOut: true,
                    secondIn: true,
                    secondOut: true
                }
            });

            const [fetched_employee, fetched_schedules] = await prisma.$transaction([fetchEmployee, fetchSchedules]);

            // ! ----------------------------------------------------------------------------------------------------

            const {
                groupedSchedules,
                groupedBiometrics,
                groupedHolidays,

                scheduleComputations,

                previewBody,
                pdfBody
            } = await processData(employee_id, date_from, date_to, fetched_employee.biometricsNo, fetched_schedules, schedule_range, time_display_format);

            // ! ----------------------------------------------------------------------------------------------------

            const fetchServices = prisma.Services.findMany({
                select: {
                    id: true,
                    serviceName: true
                }
            });
            const fetchServiceSignatories = prisma.ServiceSignatories.findMany({
                select: {
                    signatoryName: true,
                    serviceID: true
                }
            });

            const [fetched_services, fetched_service_signatories] = await prisma.$transaction([fetchServices, fetchServiceSignatories]);

            // ! ----------------------------------------------------------------------------------------------------

            const serviceSignatories = fetched_service_signatories.reduce((accumulator, currentServiceSignatory) => {
                accumulator.push({
                    ...currentServiceSignatory,
                    service: fetched_services.reduce((accumulator, currentService) => {
                        if(currentServiceSignatory.serviceID === currentService.id) {
                            accumulator = currentService
                        }

                        return accumulator;
                    }, null)
                });

                return accumulator;
            }, []);

            const serviceSignatory = serviceSignatories.reduce((accumulator, currentServiceSignatory) => {
                if(currentServiceSignatory.serviceID === fetched_employee.serviceID) {
                    accumulator = currentServiceSignatory;
                }

                return accumulator;
            }, null);

            // ! ----------------------------------------------------------------------------------------------------

            const last_name_group = fetched_employee.lastName.replace(/ /g, '');
            const first_name_letters = fetched_employee.firstName.split(/\s+/)
                .reduce((accumulator, currentFirstNameWord) => {
                    accumulator = accumulator.concat(currentFirstNameWord.charAt(0));

                    return accumulator;
                }, '');
            const date_range = moment(date_from).format('YYMMDD')+'-'+moment(date_to).format('YYMMDD');
            const file_name = last_name_group+''+first_name_letters+'-'+date_range;

            // ! ----------------------------------------------------------------------------------------------------

            return {
                employeeDetail: {
                    lastName: fetched_employee.lastName,
                    firstName: fetched_employee.firstName,
                    employeeID: fetched_employee.employeeID,
                    biometricsNo: fetched_employee.biometricsNo,
                    serviceID: fetched_employee.serviceID,
                    sectionID: fetched_employee.sectionID,
                    unitID: fetched_employee.unitID,

                    fullName: fetched_employee.middleName
                        ? fetched_employee.firstName+' '+(fetched_employee.middleName).charAt(0)+'. '+fetched_employee.lastName
                        : fetched_employee.firstName+' '+fetched_employee.lastName,
                    displayName: fetched_employee.lastName+', '+fetched_employee.firstName
                },

                groupedSchedules: groupedSchedules,
                groupedBiometrics: groupedBiometrics,
                groupedHolidays: groupedHolidays,

                scheduleComputations: scheduleComputations,

                previewBody: previewBody,
                pdfBody: pdfBody,

                settings: {
                    date_range: {
                        from: date_from,
                        to: date_to
                    },
                    range_group: range_group
                },
                file: {
                    name: file_name,
                    header: {
                        month: (range_group === 'previous' || range_group === 'next')
                            ? moment(date_from).format('MMMM YYYY')+' - '+moment(date_to).format('MMMM YYYY')
                            : moment(date_from).format('MMMM YYYY')
                    },
                    footer: {
                        service_signatory: serviceSignatory
                    }
                }
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
        }
    } catch(error) {
        console.error(error);

        return error;
    }
});