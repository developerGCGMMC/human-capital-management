<script setup>
    definePageMeta({
        layout: 'panel'
    });

    import moment from 'moment';

    const user = useSupabaseUser();

    // ! ----------------------------------------------------------------------------------------------------

    const pendings = reactive({
        fetch_offices: false,
        fetch_employees: false,
        fetch_schedules: false,

        insert_schedule: false,
        fetch_schedule: false,
        delete_schedule: false
    });

    const filter_dropdown = reactive({
        service_id: null,
        office_id: null,
        employment_status: null
    });
    const filter_dropdown_options = reactive({
        service_ids: [],
        office_map: [],
        employment_status: [
            { id: 'permanent', name: 'Permanent' },
            { id: 'contract_of_service', name: 'Contract of Service' },
            { id: 'job_order', name: 'Job Order' },
            { id: 'temporary', name: 'Temporary' }
        ]
    });

    const filter_autocomplete_suggestions = reactive({
        employees: []
    });

    // ! ----------------------------------------------------------------------------------------------------

    const original_data = {
        offices: [],
        employees: []
    };

    const forms = reactive({
        selected_employees: [],
        selected_dates: [],
        selected_day_type: null,
        selected_schedules: [],

        selected_employee_schedules: []
    });
    const form_dropdown_options = {
        day_type: [
            { id: 'schedule', name: 'Schedules' },
            { id: 'leave', name: 'Leave' },
            { id: 'official_business', name: 'Official Business' },
            { id: 'official_time', name: 'Official Time' },
            { id: 'replacement_off', name: 'Replacement Off' },
            { id: 'holiday_off', name: 'Holiday Off' },
            { id: 'work_suspension', name: 'Work Suspension' }
        ]
    };
    const form_multiselect_options = reactive({
        schedules: []
    });

    // ! ----------------------------------------------------------------------------------------------------

    const results = reactive({
        selected_employees: []
    });

    // ! ----------------------------------------------------------------------------------------------------

    const { data: _data_offices, execute: fetchOffices } = await useFetch('/api/offices', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        immediate: false,
        watch: false,

        async onRequest() {
            pendings.fetch_offices = true;
        },
        async onRequestError({ error }) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: '[Fetch Request Error] '+error,
                life: 5000
            });
        },
        async onResponse({ _request, response }) {
            // console.log('[onResponse] fetchOffices: '+JSON.stringify(response._data.data.service_ids));

            original_data.offices = response._data;

            filter_dropdown_options.service_ids = response._data.data.service_ids;
            filter_dropdown_options.office_map = response._data.data.office_map;

            setTimeout(() => {
                pendings.fetch_offices = false;
            }, 500);
        },
        async onResponseError({ response }) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: '[Fetch Response Error] '+response.status+': '+response.statusText,
                life: 5000
            });
        }
    });

    const onChangeServiceID = (event) => {
        filter_dropdown.office_id = null;
        filter_dropdown.employment_status = null;

        forms.selected_employees = [];

        if(event.value === null) {
            filter_dropdown_options.office_map = original_data.offices.data.office_map;
        } else {
            filter_dropdown_options.office_map = original_data.offices.data.office_map.reduce((accumulator, currentOfficeMap) => {
                if(event.value == currentOfficeMap.serviceID) {
                    accumulator.push(currentOfficeMap);
                }

                return accumulator;
            }, [])
            .sort((prev, next) => {
                return prev.officeName > next.officeName
                    ? 1
                    : ((prev.officeName < next.officeName)
                        ? -1
                        : 0);
            });
        }
    };
    const onChangeOfficeID = (event) => {
        if(event.value === null) {
            filter_dropdown.employment_status = null;
            forms.selected_employees = [];
            results.selected_employees = [];
        } else {
            forms.selected_employees = original_data.employees.reduce((accumulator, currentEmployee) => {
                if((currentEmployee.section?.id === event.value
                        || currentEmployee.unit?.id === event.value)
                    && (filter_dropdown.employment_status
                        ? currentEmployee.appointmentStatus === filter_dropdown.employment_status
                        : 1 === 1)
                    ) {
                    accumulator.push(currentEmployee);
                }

                return accumulator;
            }, []);

            // fetchEmployeeSchedules();
        }
    };
    const onChangeAppointmentStatus = (event) => {
        if(event.value === null) {
            forms.selected_employees = original_data.employees.reduce((accumulator, currentEmployee) => {
                if(currentEmployee.section?.id === filter_dropdown.office_id
                    || currentEmployee.unit?.id === filter_dropdown.office_id) {
                    accumulator.push(currentEmployee);
                }

                return accumulator;
            }, []);
        } else {
            forms.selected_employees = original_data.employees.reduce((accumulator, currentEmployee) => {
                if(currentEmployee.appointmentStatus === event.value
                    && (currentEmployee.section?.id === filter_dropdown.office_id
                        || currentEmployee.unit?.id === filter_dropdown.office_id)) {
                    accumulator.push(currentEmployee);
                }

                return accumulator;
            }, []);
        }
    };

    // ! ----------------------------------------------------------------------------------------------------

    const { data: _data_employees, execute: fetchEmployees } = await useFetch('/api/employees', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        immediate: false,
        watch: false,

        async onRequest() {
            pendings.fetch_employees = true;
        },
        async onRequestError({ error }) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: '[Fetch Request Error] '+error,
                life: 5000
            });
        },
        async onResponse({ _request, response }) {
            // console.log('[onResponse] fetchEmployees: '+JSON.stringify(response._data));

            const sorted_employees = response._data.reduce((accumulator, currentEmployee) => {
                accumulator.push({
                    ...currentEmployee,
                    fullName: currentEmployee.lastName+', '+currentEmployee.firstName
                });

                return accumulator;
            }, []);

            original_data.employees = sorted_employees;
            filter_autocomplete_suggestions.employees = sorted_employees;

            setTimeout(() => {
                pendings.fetch_employees = false;
            }, 500);
        },
        async onResponseError({ response }) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: '[Fetch Response Error] '+response.status+': '+response.statusText,
                life: 5000
            });
        }
    });

    const onSearchCompleteEmployees = (event) => {
        setTimeout(() => {
            if(!filter_dropdown.service_id && !filter_dropdown.office_id && !event.query.trim().length) {
                // ! no serviceID, no officeID, no searchEmployee
                filter_autocomplete_suggestions.employees = [...original_data.employees];
            } else {
                filter_autocomplete_suggestions.employees = original_data.employees.reduce((accumulator, currentEmployee) => {
                    if((filter_dropdown.service_id
                            ? (currentEmployee.service?.id === filter_dropdown.service_id)
                            : 1 === 1)
                        && (filter_dropdown.office_id
                            ? (currentEmployee.section?.id === filter_dropdown.office_id
                                || currentEmployee.unit?.id === filter_dropdown.office_id)
                            : 1 === 1)
                        && (filter_dropdown.employment_status
                            ? (currentEmployee.appointmentStatus === filter_dropdown.employment_status)
                            : 1 === 1)
                        && (event.query.trim().length
                            ? (currentEmployee.fullName.toLowerCase().includes(event.query.toLowerCase())
                                || currentEmployee.employeeID === event.query
                                || currentEmployee.biometricsNo === event.query)
                            : 1 === 1)
                    ) {
                        accumulator.push(currentEmployee);
                    }

                    return accumulator;
                }, []);
            }
        }, 250);
    };
    const onItemSelectEmployees = (event) => {
        // console.log('onItemSelectEmployees: '+event.value.id);
    };
    const onItemUnselectEmployees = (event) => {
        // console.log('onItemUnselectEmployees: '+event.value.id);

        results.selected_employees = results.selected_employees.filter((currentEmployee) => {
            return currentEmployee.id !== event.value.id;
        });
    };

    // ! ----------------------------------------------------------------------------------------------------

    const { data: _data_schedules, execute: fetchSchedules } = await useFetch('/api/schedules', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        immediate: false,
        watch: false,

        async onRequest() {
            pendings.fetch_schedules = true;
        },
        async onRequestError({ error }) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: '[Fetch Request Error] '+error,
                life: 5000
            });
        },
        async onResponse({ _request, response }) {
            // console.log('[onResponse] fetchSchedules: '+JSON.stringify(response._data));

            form_multiselect_options.schedules = response._data;

            setTimeout(() => {
                pendings.fetch_schedules = false;
            }, 500);
        },
        async onResponseError({ response }) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: '[Fetch Response Error] '+response.status+': '+response.statusText,
                life: 5000
            });
        }
    });

    // ! ----------------------------------------------------------------------------------------------------

    const removeSelectedEmployee = (employee_id) => {
        forms.selected_employees = forms.selected_employees.filter((currentEmployee) => {
            return currentEmployee.id !== employee_id;
        });

        results.selected_employees = results.selected_employees.filter((currentEmployee) => {
            return currentEmployee.id !== employee_id;
        });

        if(forms.selected_employees.length === 0) {
            filter_dropdown.service_id = null;
            filter_dropdown.office_id = null;
            filter_dropdown.employment_status = null;
        }
    };

    // ! ----------------------------------------------------------------------------------------------------

    const avatar_link = 'https://res.cloudinary.com/dtcgyjwzt/image/upload/v1709782922/avatar/employees/';

    // ! ----------------------------------------------------------------------------------------------------

    const panel_menu_ref = ref();
    const panel_menu = {
        settings: [
            { label: 'Print', icon: 'pi pi-print' },
            { separator: true },
            { label: 'Refresh', icon: 'pi pi-refresh', command: () => clearAll() }
        ]
    };

    const clearAll = () => {
        filter_dropdown.service_id = null;
        filter_dropdown.office_id = null;
        filter_dropdown.employment_status = null;

        forms.selected_employees = [];
        forms.selected_dates = [];
        forms.selected_day_type = null;
        // forms.selected_schedules = [];

        forms.selected_employee_schedules = [];
    };

    // ! ----------------------------------------------------------------------------------------------------

    import { useConfirm } from "primevue/useconfirm";
    const confirm = useConfirm();
    import { useToast } from 'primevue/usetoast';
    const toast = useToast();

    // ! ----------------------------------------------------------------------------------------------------

    const onChangeDayType = () => {
        forms.selected_schedules = [];
    };

    // ! ----------------------------------------------------------------------------------------------------

    const selected_employee_ids = computed(() => {
        return forms.selected_employees.reduce((accumulator, currentEmployee) => {
            accumulator.push(currentEmployee.id);

            return accumulator;
        }, []);
    });

    const selected_dates = computed(() => {
        return forms.selected_dates.reduce((accumulator, currentDate) => {
            accumulator.push(moment(currentDate).format('YYYY-MM-DD'));

            return accumulator;
        }, []);
    });

    const calendar_settings = reactive({
        year: moment().format('YYYY'),
        month: moment().format('MM')
    });

    // ! ----------------------------------------------------------------------------------------------------

    const processEmployeeSchedule = () => {
        toast.add({
            severity: 'info',
            summary: 'Processing',
            detail: 'Assigning schedule..',
            life: 6000
        });

        // console.log('forms.selected_dates: '+JSON.stringify(forms.selected_dates));
        // forms.selected_dates.forEach((selected_date) => {
        //     console.log('selected_date: '+moment(selected_date).format('YYYY-MM-DD'));
        // });

        // console.log('forms.selected_schedules: '+JSON.stringify(forms.selected_schedules));

        // console.log('forms.selected_employees: '+JSON.stringify(forms.selected_employees));
        // forms.selected_employees.forEach((selected_employee) => {
        //     console.log('selected_employee: '+selected_employee.lastName);
        // });


        // if(!forms.selected_employees || !forms.selected_dates || !forms.selected_schedules || !forms.selected_day_type) {
        //     toast.add({
        //         severity: 'error',
        //         summary: 'Error',
        //         detail: 'Missing fields',
        //         life: 5000
        //     });

        //     return false;
        // }

        insertEmployeeSchedule();
    };

    const { data: _post_data, execute: insertEmployeeSchedule } = useFetch('/api/employees/schedules', {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: {
            user_id: user?.value?.id ?? null,
            selected_employee_ids: selected_employee_ids,
            selected_dates: selected_dates,
            selected_schedule_ids: computed(() => {
                return forms.selected_schedules;
            }),
            calendar_settings: calendar_settings
        },
        immediate: false,
        watch: false,

        async onRequest() {
            pendings.insert_schedule = true;
        },
        async onRequestError({ error }) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: '[Fetch Request Error] '+error,
                life: 5000
            });
        },
        async onResponse({ _request, response }) {
            setTimeout(() => {
                pendings.insert_schedule = false;

                fetchEmployeeSchedules();
            }, 2000);

            toast.removeAllGroups();

            // console.log('[onResponse] insertEmployeeSchedule: '+JSON.stringify(response._data));

            forms.selected_dates = [];
            forms.selected_schedules = [];

            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Schedule(s) assigned to employee(s)',
                life: 4000
            });
        },
        async onResponseError({ response }) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: '[Fetch Response Error] '+response.status+': '+response.statusText,
                life: 5000
            });
        }
    });

    // ! ----------------------------------------------------------------------------------------------------

    let on_month_change_timer;
    const onMonthChangeCalendar = (event) => {
        let year = String(event.year);
        let month = String(event.month).padStart(2, '0');

        clearTimeout(on_month_change_timer);

        on_month_change_timer = setTimeout(() => {
            calendar_settings.year = year;
            calendar_settings.month = month;
        }, 200);
    };
    const onTodayClickCalendar = (event) => {
        calendar_settings.year = moment(event).format('YYYY');
        calendar_settings.month = moment(event).format('MM');
    };
    const onClearClickCalendar = () => {
        calendar_settings.year = moment().format('YYYY');
        calendar_settings.month = moment().format('MM');
    };

    // ! ----------------------------------------------------------------------------------------------------

    const { data: _put_data, execute: fetchEmployeeSchedules } = useFetch('/api/employees/schedules', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json'
        },
        body: {
            user_id: user?.value?.id ?? null,
            selected_employee_ids: selected_employee_ids,
            calendar_settings: calendar_settings
        },
        immediate: false,
        // watch: false,

        async onRequest() {
            pendings.fetch_schedule = true;
        },
        async onRequestError({ error }) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: '[Fetch Request Error] '+error,
                life: 5000
            });
        },
        async onResponse({ _request, response }) {
            setTimeout(() => {
                pendings.fetch_schedule = false;
            }, 500);

            // console.log('[onResponse] fetchEmployeeSchedules: '+JSON.stringify(response));

            results.selected_employees = forms.selected_employees.reduce((accumulator, currentEmployee) => {
                accumulator.push({
                    id: currentEmployee.id,
                    lastName: currentEmployee.lastName,
                    firstName: currentEmployee.firstName,
                    fullName: currentEmployee.fullName,
                    appointmentStatus: currentEmployee.appointmentStatus,
                    employeeID: currentEmployee.employeeID,
                    biometricsNo: currentEmployee.biometricsNo,
                    service: currentEmployee.service,
                    section: currentEmployee.section,
                    unit: currentEmployee.unit,

                    // employeeSchedules: response._data.employees.reduce((accumulator, currentEmployeeSchedules) => {
                    //     if(currentEmployeeSchedules.id === currentEmployee.id) {
                    //         accumulator.push(currentEmployeeSchedules.employeeSchedules);
                    //     }

                    //     return accumulator;
                    // }, []).pop(),

                    // reduceFunction: response._data.employees.reduce((accumulator, currentEmployeeSchedules) => {
                    //     if(currentEmployeeSchedules.id === currentEmployee.id) {
                    //         accumulator.push(
                    //             currentEmployeeSchedules.employeeSchedules.reduce((accumulator, currentSchedule) => {
                    //                 accumulator[currentSchedule.scheduleDate] = accumulator[currentSchedule.scheduleDate] ?? [];
                    //                 accumulator[currentSchedule.scheduleDate].push(currentSchedule);

                    //                 return accumulator;
                    //             }, {})
                    //         );
                    //     }

                    //     return accumulator;
                    // }, []).pop(),

                    // groupBy: response._data.employees.reduce((accumulator, currentEmployeeSchedules) => {
                    //     if(currentEmployeeSchedules.id === currentEmployee.id) {
                    //         accumulator.push(
                    //             Object.groupBy(currentEmployeeSchedules.employeeSchedules, employeeSchedules => {
                    //                 return employeeSchedules.scheduleDate;
                    //             })
                    //         );
                    //     }

                    //     return accumulator;
                    // }, []).pop(),

                    // testOne: Object.keys(response._data.employees.reduce((accumulator, currentEmployeeSchedules) => {
                    //     if(currentEmployeeSchedules.id === currentEmployee.id) {
                    //         accumulator.push(
                    //             currentEmployeeSchedules.employeeSchedules.reduce((accumulator, currentSchedule) => {
                    //                 accumulator[currentSchedule.scheduleDate] = accumulator[currentSchedule.scheduleDate] ?? [];
                    //                 accumulator[currentSchedule.scheduleDate].push(currentSchedule);

                    //                 return accumulator;
                    //             }, {})
                    //         );
                    //     }

                    //     return accumulator;
                    // }, []).pop()).reduce((accumulator, keySchedule) => {
                    //     accumulator.push({
                    //         scheduleDate: keySchedule,
                    //         schedules: response._data.employees.reduce((accumulator, currentEmployeeSchedules) => {
                    //             if(currentEmployeeSchedules.id === currentEmployee.id) {
                    //                 for(const [objectKey, objectValue] of Object.entries(Object.groupBy(currentEmployeeSchedules.employeeSchedules, employeeSchedules => {
                    //                     return employeeSchedules.scheduleDate;
                    //                 }))) {
                    //                     if(objectKey === keySchedule) {
                    //                         accumulator.push(objectValue.reduce((accumulator, objj) => {
                    //                             accumulator.push({
                    //                                 id: objj.id,
                    //                                 scheduleID: objj.scheduleID,
                    //                                 scheduleName: objj.schedules.scheduleName
                    //                             });

                    //                             return accumulator;
                    //                         }, []));
                    //                     }
                    //                 }
                    //             }

                    //             return accumulator;
                    //         }, []).pop()
                    //     });

                    //     return accumulator;
                    // }, []),

                    employeeSchedules: Object.keys(response._data.reduce((accumulator, currentEmployeeSchedules) => {
                        if(currentEmployeeSchedules.id === currentEmployee.id) {
                            accumulator.push(
                                Object.groupBy(currentEmployeeSchedules.employeeSchedules, employeeSchedules => {
                                    return employeeSchedules.scheduleDate;
                                })
                            );
                        }

                        return accumulator;
                    }, []).pop()).reduce((accumulator, keySchedule) => {
                        accumulator.push({
                            scheduleDate: keySchedule,
                            schedules: response._data.reduce((accumulator, currentEmployeeSchedules) => {
                                if(currentEmployeeSchedules.id === currentEmployee.id) {
                                    for(const [objectKey, objectValue] of Object.entries(Object.groupBy(currentEmployeeSchedules.employeeSchedules, employeeSchedules => {
                                        return employeeSchedules.scheduleDate;
                                    }))) {
                                        if(objectKey === keySchedule) {
                                            accumulator.push(objectValue.reduce((accumulator, objj) => {
                                                accumulator.push({
                                                    id: objj.id,
                                                    scheduleID: objj.scheduleID,
                                                    scheduleName: objj.schedules.scheduleName
                                                });

                                                return accumulator;
                                            }, []));
                                        }
                                    }
                                }

                                return accumulator;
                            }, []).pop()
                        });

                        return accumulator;
                    }, [])
                });

                return accumulator;
            }, []);
        },
        async onResponseError({ response }) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: '[Fetch Response Error] '+response.status+': '+response.statusText,
                life: 5000
            });
        }
    });

    // ! ----------------------------------------------------------------------------------------------------

    const selected_employee_schedule_ids = computed(() => {
        return forms.selected_employee_schedules;
    });

    const confirmDeleteEmployeeSchedules = () => {
        confirm.require({
            group: 'templating',
            header: 'Confirm Remove',
            icon: 'pi pi-exclamation-circle',
            message: 'Proceed removing of employee schedules?',
            accept: () => {
                toast.add({
                    severity: 'info',
                    summary: 'Processing',
                    detail: 'Removing employee schedules..',
                    life: 20000
                });

                deleteEmployeeSchedules();
            },
            reject: () => {
                toast.add({
                    severity: 'info',
                    summary: 'Cancelled',
                    detail: 'Removing of employee schedules cancelled',
                    life: 3000
                });
            }
        });
    };

    const { data: _delete_data, execute: deleteEmployeeSchedules } = useFetch('/api/employees/schedules', {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json'
        },
        body: {
            user_id: user?.value?.id ?? null,
            selected_employee_ids: selected_employee_ids,
            selected_employee_schedule_ids: selected_employee_schedule_ids,
            calendar_settings: calendar_settings
        },
        immediate: false,
        watch: false,

        async onRequest() {
            pendings.delete_schedule = true;
        },
        async onRequestError({ error }) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: '[Delete Request Error] '+error,
                life: 5000
            });
        },
        async onResponse({ _request, response }) {
            setTimeout(() => {
                pendings.delete_schedule = false;
            }, 1000);

            toast.removeAllGroups();

            console.log('[onResponse] deleteEmployeeSchedules: '+JSON.stringify(response._data));

            results.selected_employees = forms.selected_employees.reduce((accumulator, currentEmployee) => {
                accumulator.push({
                    id: currentEmployee.id,
                    lastName: currentEmployee.lastName,
                    firstName: currentEmployee.firstName,
                    fullName: currentEmployee.fullName,
                    appointmentStatus: currentEmployee.appointmentStatus,
                    employeeID: currentEmployee.employeeID,
                    biometricsNo: currentEmployee.biometricsNo,
                    service: currentEmployee.service,
                    section: currentEmployee.section,
                    unit: currentEmployee.unit,

                    employeeSchedules: Object.keys(response._data.reduce((accumulator, currentEmployeeSchedules) => {
                        if(currentEmployeeSchedules.id === currentEmployee.id) {
                            accumulator.push(
                                Object.groupBy(currentEmployeeSchedules.employeeSchedules, employeeSchedules => {
                                    return employeeSchedules.scheduleDate;
                                })
                            );
                        }

                        return accumulator;
                    }, []).pop()).reduce((accumulator, keySchedule) => {
                        accumulator.push({
                            scheduleDate: keySchedule,
                            schedules: response._data.reduce((accumulator, currentEmployeeSchedules) => {
                                if(currentEmployeeSchedules.id === currentEmployee.id) {
                                    for(const [objectKey, objectValue] of Object.entries(Object.groupBy(currentEmployeeSchedules.employeeSchedules, employeeSchedules => {
                                        return employeeSchedules.scheduleDate;
                                    }))) {
                                        if(objectKey === keySchedule) {
                                            accumulator.push(objectValue.reduce((accumulator, objj) => {
                                                accumulator.push({
                                                    id: objj.id,
                                                    scheduleID: objj.scheduleID,
                                                    scheduleName: objj.schedules.scheduleName
                                                });

                                                return accumulator;
                                            }, []));
                                        }
                                    }
                                }

                                return accumulator;
                            }, []).pop()
                        });

                        return accumulator;
                    }, [])
                });

                return accumulator;
            }, []);

            forms.selected_employee_schedules = [];

            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Employee schedules removed',
                life: 4000
            });
        },
        async onResponseError({ response }) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: '[Delete Response Error] '+response.status+': '+response.statusText,
                life: 5000
            });
        }
    });

    // ! ----------------------------------------------------------------------------------------------------

    const visible = reactive({
        biometrics_in_out: false,
        daily_time_record: false
    });

    const selected_employee_id = ref(null);

    const daily_time_record = reactive({
        employee: {
            employeeID: null,
            biometricsNo: null,
            fullName: null,
            displayName: null
        },

        schedules: [],
        biometrics: [],

        settings: {
            from: null,
            to: null
        },

        groupedSchedules: [],
        groupedBiometrics: [],

        testGroupings: []
    });
    const clearDailyTimeRecord = () => {
        daily_time_record.employee.employeeID = null;
        daily_time_record.employee.biometricsNo = null;
        daily_time_record.employee.fullName = null;
        daily_time_record.employee.displayName = null;

        daily_time_record.schedules = [];
        daily_time_record.biometrics = [];

        daily_time_record.settings.from = null;
        daily_time_record.settings.to = null;

        daily_time_record.groupedSchedules = [];
        daily_time_record.groupedBiometrics = [];

        daily_time_record.testGroupings = [];
    };

    const viewBiometricsInOut = (employee_id) => {
        visible.biometrics_in_out = true;

        selected_employee_id.value = employee_id;

        clearDailyTimeRecord();
        fetchEmployeeBiometrics();
    };

    const { data: _get_data, execute: fetchEmployeeBiometrics, status: _status_fetch_employee_biometrics } = useFetch('/api/employees/biometrics', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        query: {
            user_id: user?.value?.id ?? null,
            selected_employee_id: selected_employee_id,
            calendar_year: computed(() => calendar_settings.year),
            calendar_month: computed(() => calendar_settings.month)
        },
        immediate: false,
        watch: false,

        async onRequest() {
        },
        async onRequestError({ error }) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: '[Fetch Request Error] '+error,
                life: 5000
            });
        },
        async onResponse({ _request, response }) {
            // console.log('onResponse_fetchEmployeeBiometrics: '+JSON.stringify(response._data));

            daily_time_record.employee.fullName = response._data.fullName;
            daily_time_record.employee.displayName = response._data.displayName;
            daily_time_record.employee.employeeID = response._data.employeeID;
            daily_time_record.employee.biometricsNo = response._data.biometricsNo;
            daily_time_record.schedules = response._data.employeeSchedules;
            daily_time_record.biometrics = response._data.biometricsInOut;
            daily_time_record.settings.from = response._data.settings.from;
            daily_time_record.settings.to = response._data.settings.to;

            // daily_time_record.groupedSchedules = Object.groupBy(response._data.employeeSchedules, (schedules) => {
            //     return moment(schedules.scheduleDate).format('YYYY-MM-DD');
            // });
            // daily_time_record.groupedBiometrics = response._data.biometricsInOut.reduce((accumulator, currentBiometric) => {
            //     (accumulator[moment(currentBiometric.checkTime).format('YYYY-MM-DD')] = accumulator[moment(currentBiometric.checkTime).format('YYYY-MM-DD')] || []).push({
            //         checkTime: currentBiometric.checkTime,
            //         checkType: currentBiometric.checkType
            //     });

            //     return accumulator;
            // }, {});


            daily_time_record.groupedSchedules = response._data.groupedSchedules;
            daily_time_record.groupedBiometrics = response._data.groupedBiometrics;

            // daily_time_record.groupedSchedules = Object.entries(Object.groupBy(response._data.employeeSchedules, (schedules) => {
            //     return moment(schedules.scheduleDate).format('YYYY-MM-DD');
            // })).reduce((accumulator, currentSchedule) => {
            //     accumulator.push({
            //         scheduleDate: currentSchedule[0],
            //         schedules: currentSchedule[1]
            //     });

            //     return accumulator;
            // }, []);

            // daily_time_record.groupedBiometrics = Object.entries(Object.groupBy(response._data.biometricsInOut, (biometrics) => {
            //     return moment(biometrics.checkTime).format('YYYY-MM-DD');
            // })).reduce((accumulator, currentBiometric) => {
            //     accumulator.push({
            //         checkDate: currentBiometric[0],
            //         biometrics: currentBiometric[1]
            //     });

            //     return accumulator;
            // }, []);

            daily_time_record.testGroupings = Object.entries(Object.groupBy(response._data.employeeSchedules, (schedules) => {
                return moment(schedules.scheduleDate).format('YYYY-MM-DD');
            })).reduce((accumulator, currentSchedule) => {
                accumulator.push({
                    scheduleDate: currentSchedule[0],
                    scheduleBiometrics: currentSchedule[1].reduce((accumulator, currentSchedule) => {
                        let time_display_format = 'h:mm';

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
                                    from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
                                    to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss')
                                },
                                firstOut: {
                                    from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).add(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
                                    to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.secondIn).format('YYYY-MM-DD HH:mm:ss')
                                },
                                secondIn: {
                                    from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).format('YYYY-MM-DD HH:mm:ss'),
                                    to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.secondOut).subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss')
                                },
                                secondOut: {
                                    from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.secondIn).add(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
                                    to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.secondOut).add(1, 'hours').format('YYYY-MM-DD HH:mm:ss')
                                }
                            };
                        } else if(currentSchedule.schedules.scheduleCategory === 'toMidnight') {
                            scheduleRange = {
                                firstIn: {
                                    from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
                                    to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).add(1, 'days').subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss')
                                },
                                firstOut: {
                                    from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).add(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
                                    to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).add(1, 'days').add(1, 'hours').format('YYYY-MM-DD HH:mm:ss')
                                }
                            };
                        } else if(currentSchedule.schedules.scheduleCategory === 'twoDays') {
                            scheduleRange = {
                                firstIn: {
                                    from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
                                    to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).add(1, 'days').subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss')
                                },
                                firstOut: {
                                    from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).add(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
                                    to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).add(1, 'days').add(1, 'hours').format('YYYY-MM-DD HH:mm:ss')
                                }
                            };
                        } else {
                            scheduleRange = {
                                firstIn: {
                                    from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
                                    to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss')
                                },
                                firstOut: {
                                    from: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstIn).add(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
                                    to: moment(currentSchedule.scheduleDate+' '+currentSchedule.schedules.firstOut).add(1, 'hours').format('YYYY-MM-DD HH:mm:ss')
                                }
                            };
                        }

                        // ! ----------------------------------------------------------------------------------------------------

                        let biometricCapture = null;
                        if(currentSchedule.schedules.scheduleCategory === 'oneBreak') {
                            biometricCapture = {
                                firstIn: response._data.biometricsInOut.reduce((accumulator, currentBiometric) => {
                                    if(moment(currentBiometric.checkTime).isBetween(moment(scheduleRange.firstIn.from), moment(scheduleRange.firstIn.to), undefined, []) === true
                                        && currentBiometric.checkType === 'in') {
                                        accumulator = currentBiometric;
                                    }

                                    return accumulator;
                                }, { checkTime: null, checkType: null }),
                                firstOut: response._data.biometricsInOut.reduce((accumulator, currentBiometric) => {
                                    if(moment(currentBiometric.checkTime).isBetween(moment(scheduleRange.firstOut.from), moment(scheduleRange.firstOut.to), undefined, []) === true
                                        && currentBiometric.checkType === 'out') {
                                        accumulator = currentBiometric;
                                    }

                                    return accumulator;
                                }, { checkTime: null, checkType: null }),
                                secondIn: response._data.biometricsInOut.reduce((accumulator, currentBiometric) => {
                                    if(moment(currentBiometric.checkTime).isBetween(moment(scheduleRange.secondIn.from), moment(scheduleRange.secondIn.to), undefined, []) === true
                                        && currentBiometric.checkType === 'in') {
                                        accumulator = currentBiometric;
                                    }

                                    return accumulator;
                                }, { checkTime: null, checkType: null }),
                                secondOut: response._data.biometricsInOut.reduce((accumulator, currentBiometric) => {
                                    if(moment(currentBiometric.checkTime).isBetween(moment(scheduleRange.secondOut.from), moment(scheduleRange.secondOut.to), undefined, []) === true
                                        && currentBiometric.checkType === 'out') {
                                        accumulator = currentBiometric;
                                    }

                                    return accumulator;
                                }, { checkTime: null, checkType: null })
                            };
                        } else {
                            biometricCapture = {
                                firstIn: response._data.biometricsInOut.reduce((accumulator, currentBiometric) => {
                                    if(moment(currentBiometric.checkTime).isBetween(moment(scheduleRange.firstIn.from), moment(scheduleRange.firstIn.to), undefined, []) === true
                                        && currentBiometric.checkType === 'in') {
                                        accumulator = currentBiometric;
                                    }

                                    return accumulator;
                                }, { checkTime: null, checkType: null }),
                                firstOut: response._data.biometricsInOut.reduce((accumulator, currentBiometric) => {
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
                                dayNo: '('+moment(currentSchedule.scheduleDate).subtract(1, 'days').format('D')+') - '+moment(currentSchedule.scheduleDate).format('D'),
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
                                dayNo: moment(currentSchedule.scheduleDate).format('D')+' - ('+moment(currentSchedule.scheduleDate).add(1, 'days').format('D')+')',
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
                                dayNo: moment(currentSchedule.scheduleDate).format('D')+' - '+moment(currentSchedule.scheduleDate).add(1, 'days').format('D'),
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


        },
        async onResponseError({ response }) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: '[Fetch Response Error] '+response.status+': '+response.statusText,
                life: 5000
            });
        }
    });

     // ! ----------------------------------------------------------------------------------------------------

    onMounted(async () => {
        watchEffect(async () => {
            if(!user.value) {
                await navigateTo('/');
            }
        });

        fetchOffices();
        fetchEmployees();
        fetchSchedules();
    });
</script>
<template>
    <div class="container p-4">
        <Toast />
        <ConfirmDialog group="templating">
            <template #container="{ message, acceptCallback, rejectCallback }">
                <div class="flex flex-col items-center w-96 p-2 surface-overlay surface-border border-round">
                    <div class="flex flex-col items-center gap-4 mt-4 w-full">
                        <span class="font-medium tracking-wide">{{ message.header }}</span>
                        <i :class="message.icon" class="text-5xl text-orange-400"></i>
                        <p>{{ message.message }}</p>
                    </div>
                    <Divider class="my-2" />
                    <div class="flex items-center gap-2 w-full">
                        <Button @click="rejectCallback" label="Cancel" severity="secondary" outlined class="w-full"></Button>
                        <Button @click="acceptCallback" label="Remove" severity="warning" class="w-full"></Button>
                    </div>
                </div>
            </template>
        </ConfirmDialog>

        <Panel style="background-color: var(--surface-50);">
            <template #header>
                <div class="flex items-center gap-2">
                    <Avatar icon="pi pi-book" size="large" style="background-color: var(--surface-0); color: var(--primary-500);" />
                    <span class="p-text-secondary">Time Management</span>
                </div>
            </template>
            <template #icons>
                <Button @click="panel_menu_ref.toggle($event)" icon="pi pi-cog" severity="secondary" />
                <Menu ref="panel_menu_ref" :model="panel_menu.settings" :popup="true" />
            </template>

            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-9 flex flex-col gap-4 w-full">
                    <div class="grid grid-cols-12 gap-2">
                        <div class="col-span-12 md:col-span-4 p-fluid">
                            <Dropdown v-model="filter_dropdown.service_id" :options="filter_dropdown_options.service_ids" optionValue="id" optionLabel="serviceName"
                                @change="onChangeServiceID($event)" showClear
                                :loading="pendings.fetch_offices"
                                placeholder="Service" />
                        </div>
                        <div class="col-span-12 md:col-span-4 p-fluid">
                            <Dropdown v-model="filter_dropdown.office_id" :options="filter_dropdown_options.office_map" optionValue="officeID" optionLabel="officeName"
                                @change="onChangeOfficeID($event)" showClear
                                :loading="pendings.fetch_offices"
                                placeholder="Section / Unit" />
                        </div>
                        <div class="col-span-12 md:col-span-4 p-fluid">
                            <Dropdown v-model="filter_dropdown.employment_status" :options="filter_dropdown_options.employment_status" optionValue="id" optionLabel="name"
                                @change="onChangeAppointmentStatus($event)" :disabled="!filter_dropdown.office_id" showClear placeholder="Employment" />
                        </div>
                        <div class="col-span-12 md:col-span-12 p-fluid">
                            <AutoComplete v-model="forms.selected_employees" :suggestions="filter_autocomplete_suggestions.employees" optionLabel="fullName"
                                multiple forceSelection dropdown dropdownMode="current"
                                @complete="onSearchCompleteEmployees($event)" @item-select="onItemSelectEmployees($event)" @item-unselect="onItemUnselectEmployees($event)"
                                :loading="pendings.fetch_employees" placeholder="Employee(s)" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-4 gap-2 p-4" style="background-color: var(--surface-0);">
                        <Fieldset v-for="selected_employee in results.selected_employees" :key="selected_employee.id" >
                            <template #legend>
                                <div class="flex items-center pl-2 py-1 border rounded-md" style="background-color: var(--primary-50); color: var(--primary-500);">
                                    <Avatar :image="avatar_link+''+selected_employee.biometricsNo+'.jpg'" size="large" shape="circle" class="border" />
                                    <span class="font-medium text-sm md:text-base">{{ selected_employee.lastName }}, {{ selected_employee.firstName }}</span>
                                </div>
                            </template>
                            <div v-if="pendings.fetch_schedule" class="flex flex-col gap-2">
                                <Skeleton height="24rem" />
                            </div>
                            <div v-else class="relative h-96">
                                <Listbox v-model="forms.selected_employee_schedules" :options="selected_employee.employeeSchedules" optionLabel="scheduleDate" optionValue="id"
                                    optionGroupChildren="schedules" optionGroupLabel="scheduleName"
                                    multiple :virtualScrollerOptions="{ itemSize: 28 }"
                                    emptyMessage="No assigned schedule"
                                    class="w-full text-sm pa-0" listStyle="height:250px">
                                    <template #optiongroup="slotProps">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-1">
                                                <i class="pi pi-calendar" style="font-size: 0.85rem"></i>
                                                <p>{{ moment(slotProps.option.scheduleDate).format("MMMM D, YYYY") }}</p>
                                            </div>
                                            <p>{{ moment(slotProps.option.scheduleDate).format("dddd") }}</p>
                                        </div>
                                    </template>
                                    <template #option="slotProps">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-1">
                                                <i class="pi pi-clock" style="font-size: 0.85rem"></i>
                                                <p>{{ slotProps.option.scheduleName }}</p>
                                            </div>
                                            <i v-if="forms.selected_employee_schedules.includes(slotProps.option.id)" class="pi pi-trash" style="font-size: 0.8rem"></i>
                                        </div>
                                    </template>
                                </Listbox>
                                <div class="absolute bottom-0 left-0 flex flex-wrap justify-between items-center w-full">
                                    <div class="flex items-center gap-1">
                                        <Button @click="viewBiometricsInOut(selected_employee.id)" icon="pi pi-eye" severity="secondary" size="small" />
                                        <Button @click="removeSelectedEmployee(selected_employee.id)" v-tooltip.bottom="{ value: 'Remove selected employee', autoHide: false }" icon="pi pi-times" severity="secondary" size="small" />
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <Button @click="() => forms.selected_employee_schedules = []" v-tooltip.bottom="{ value: 'Unselect all selected schedules', autoHide: false }" icon="pi pi-refresh" :disabled="forms.selected_employee_schedules.length ? false : true" size="small" />
                                        <Button @click="confirmDeleteEmployeeSchedules()" v-tooltip.right="{ value: 'Delete all selected schedules of all selected employees(s)', autoHide: false }" icon="pi pi-trash" :disabled="forms.selected_employee_schedules.length ? false : true" size="small" />
                                    </div>
                                </div>
                            </div>
                        </Fieldset>
                    </div>

                    <div class="grid grid-cols-12 w-100 text-sm">
                        <div class="col-span-3">
                            <span class="font-medium">[calendar_settings]</span>
                            <pre class="col-span-12">{{ calendar_settings }}</pre>
                            <span class="font-medium">[forms.selected_dates]</span>
                            <pre class="col-span-12">{{ forms.selected_dates }}</pre>
                        </div>
                        <div class="col-span-3">
                            <span class="font-medium">[selected_employee_ids] {{ selected_employee_ids.length }}</span>
                            <pre class="col-span-12">{{ selected_employee_ids }}</pre>
                        </div>
                        <!-- <div class="col-span-3">
                            <span class="font-medium">[forms.selected_schedules] {{ forms.selected_schedules }}</span>
                            <pre class="col-span-12">{{ forms.selected_schedules }}</pre>
                        </div> -->
                        <div class="col-span-3">
                            <span class="font-medium">[selected_employee_schedule_ids] {{ selected_employee_schedule_ids.length }}</span>
                            <pre class="col-span-12">{{ selected_employee_schedule_ids }}</pre>
                        </div>

                        <div class="col-span-5">
                            <span class="font-medium">[forms.selected_employees] {{ forms.selected_employees.length }}</span>
                            <pre class="col-span-12">{{ forms.selected_employees }}</pre>
                        </div>
                        <div class="col-span-4">
                            <span class="font-medium">[results.selected_employees] {{ results.selected_employees.length }}</span>
                            <pre class="col-span-12">{{ results.selected_employees }}</pre>
                        </div>
                        <div class="col-span-3">
                            <span class="font-medium">[forms.selected_employee_schedules] {{ forms.selected_employee_schedules.length }}</span>
                            <pre class="col-span-12">{{ forms.selected_employee_schedules }}</pre>
                        </div>
                    </div>

                </div>

                <div class="col-span-12 md:col-span-3 w-full">
                    <Panel class="text-sm">
                        <template #header>
                            <div class="flex items-center gap-2">
                                <Avatar icon="pi pi-calendar" style="background-color: var(--surface-0); color: var(--primary-500);" />
                                <span class="p-text-secondary">Set Schedule</span>
                            </div>
                        </template>
                        <div class="flex flex-col gap-5">
                            <div class="flex flex-col gap-1 p-fluid">
                                <label for="form-calendar">Date(s)</label>
                                <Calendar v-model="forms.selected_dates" dateFormat="yy-mm-dd" selectionMode="multiple"
                                    :manualInput="false" inline showButtonBar
                                    @month-change="onMonthChangeCalendar($event)" @today-click="onTodayClickCalendar($event)" @clear-click="onClearClickCalendar()"
                                    inputId="form-calendar" class="w-full" />

                                <label for="form-day_type">Day Type</label>
                                <Dropdown v-model="forms.selected_day_type" :options="form_dropdown_options.day_type" optionValue="id" optionLabel="name"
                                    @change="onChangeDayType($event)" showClear
                                    :loading="pendings.insert_schedule"
                                    inpuId="form-day_type" />

                                <label for="form-schedules">Schedule(s)</label>
                                <MultiSelect v-model="forms.selected_schedules" :options="form_multiselect_options.schedules" optionValue="id" optionLabel="scheduleName"
                                    display="chip" :selectionLimit="3" :showToggleAll="false"
                                    :disabled="forms?.selected_day_type !== 'schedule' ? true : false"
                                    :loading="(pendings.fetch_schedules || pendings.insert_schedule) ? true : false"
                                    inpuId="form-schedules" class="w-full" />
                            </div>

                            <div class="flex gap-3 mt-0">
                                <Button @click="clearAll()" label="Clear" severity="secondary" class="w-full" />
                                <Button @click="processEmployeeSchedule()" :loading="pendings.insert_schedule" label="Save" class="w-full" />
                            </div>
                        </div>
                    </Panel>
                </div>
            </div>

            <template #footer>
                <div class="flex items-center justify-end gap-2">
                    <i class="pi pi-info-circle" style="background-color: var(--surface-0); color: var(--primary-500);" />
                    <span class="p-text-secondary text-wrap">Integrated Management Information Systems Section</span>
                </div>
            </template>
        </Panel>

        <Dialog v-model:visible="visible.biometrics_in_out" maximizable modal
            :header="'Daily Time Record: '+(daily_time_record.employee.displayName ? daily_time_record.employee.displayName+' '+daily_time_record.employee.employeeID : '')"
            :style="{ width: '100rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <div class="grid grid-cols-12 w-100 gap-1 text-sm">
                <div class="col-span-12 md:col-span-8">
                    <div class="border-2 pb-10 rounded-lg border-slate-600 w-full flex flex-col">
                        <div class="p-2 border-b-2 border-slate-600 flex flex-col">
                            <div class="w-full flex items-center justify-start">
                                <span class="font-medium text-xs italic">Civil Service Form No. 48</span>
                            </div>
                            <div class="w-full flex items-center justify-center mt-8">
                                <span class="font-bold text-2xl tracking-wider">DAILY TIME RECORD</span>
                            </div>
                            <div class="w-full flex items-center flex-col mt-4">
                                <span class="text-xl font-medium tracking-wide underline">{{ daily_time_record.employee.fullName }}</span>
                                <span class="text-sm">(Name)</span>
                            </div>
                            <div class="w-full flex items-center justify-center mt-3">
                                <span class="font-lg font-medium">For the month of</span>&nbsp;
                                <span v-if="daily_time_record.settings.from" class="font-lg font-semibold">{{ moment(daily_time_record.settings.from).format('MMMM, YYYY') }}</span>
                            </div>
                            <div class="w-full flex items-center flex-col">
                                <span class="font-lg font-medium">Official hours for arrival and departure</span>
                                <span class="font-lg font-medium">Regular days __________________________</span>
                                <span class="font-lg font-medium">Saturdays _____________________________</span>
                            </div>
                        </div>
                        <div class="w-full">
                            <div class="grid grid-cols-12">
                                <div class="col-span-1 row-span-2 border-b-2 border-r-2 border-slate-600 flex items-center justify-center font-medium">Day</div>
                                <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                    <div class="col-span-12 border-b-2 border-slate-600 flex items-center justify-center font-medium">A.M.</div>
                                    <div class="col-span-6 border-r-2 border-slate-600 flex items-center justify-center font-medium">Arrival</div>
                                    <div class="col-span-6 flex items-center justify-center font-medium">Departure</div>
                                </div>
                                <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                    <div class="col-span-12 border-b-2 border-slate-600 flex items-center justify-center font-medium">P.M.</div>
                                    <div class="col-span-6 border-r-2 border-slate-600 flex items-center justify-center font-medium">Arrival</div>
                                    <div class="col-span-6 flex items-center justify-center font-medium">Departure</div>
                                </div>
                                <div class="col-span-3 border-b-2 border-slate-600 grid grid-cols-12">
                                    <div class="col-span-12 border-b-2 border-slate-600 flex items-center justify-center font-medium">UNDERTIME</div>
                                    <div class="col-span-6 border-r-2 border-slate-600 flex items-center justify-center font-medium">Hours</div>
                                    <div class="col-span-6 flex items-center justify-center font-medium">Minutes</div>
                                </div>
                            </div>
                            <div v-for="dtr in daily_time_record.testGroupings" class="w-full">
                                <div v-for="scheduleBiometrics in dtr.scheduleBiometrics" class="w-full font-medium">

                                    <div v-if="scheduleBiometrics.scheduleCategory === 'fromMidnight'"
                                        class="grid grid-cols-12">
                                        <div class="col-span-1 row-span-2 border-b-2 border-r-2 border-slate-600 flex items-center justify-center">
                                            {{ scheduleBiometrics.scheduleSlots.dayNo }}
                                        </div>
                                        <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600"></div>
                                            <div class="col-span-6 min-h-5"></div>
                                        </div>
                                        <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.firstDay.pm.in }}</div>
                                            <div class="col-span-6 min-h-5"></div>
                                        </div>
                                        <div class="col-span-3 row-span-2 border-b-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 border-r-2 border-slate-600 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.undertime.hours }}</div>
                                            <div class="col-span-6 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.undertime.minutes }}</div>
                                        </div>

                                        <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.secondDay.am.in }}</div>
                                            <div class="col-span-6 min-h-5 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.secondDay.am.out }}</div>
                                        </div>
                                        <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600"></div>
                                            <div class="col-span-6 min-h-5"></div>
                                        </div>
                                    </div>

                                    <div v-if="scheduleBiometrics.scheduleCategory === 'noBreak'"
                                        class="grid grid-cols-12">
                                        <div class="col-span-1 min-h-5 border-b-2 border-r-2 border-slate-600 flex items-center justify-center">
                                            {{ scheduleBiometrics.scheduleSlots.dayNo }}
                                        </div>
                                        <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.firstDay.am.in }}</div>
                                            <div class="col-span-6 min-h-5 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.firstDay.am.out }}</div>
                                        </div>
                                        <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.firstDay.pm.in }}</div>
                                            <div class="col-span-6 min-h-5 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.firstDay.pm.out }}</div>
                                        </div>
                                        <div class="col-span-3 border-b-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.undertime.hours }}</div>
                                            <div class="col-span-6 min-h-5 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.undertime.minutes }}</div>
                                        </div>
                                    </div>

                                    <div v-if="scheduleBiometrics.scheduleCategory === 'oneBreak'"
                                        class="grid grid-cols-12">
                                        <div class="col-span-1 min-h-5 border-b-2 border-r-2 border-slate-600 flex items-center justify-center">
                                            {{ scheduleBiometrics.scheduleSlots.dayNo }}
                                        </div>
                                        <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.firstDay.am.in }}</div>
                                            <div class="col-span-6 min-h-5 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.firstDay.am.out }}</div>
                                        </div>
                                        <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.firstDay.pm.in }}</div>
                                            <div class="col-span-6 min-h-5 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.firstDay.pm.out }}</div>
                                        </div>
                                        <div class="col-span-3 border-b-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.undertime.hours }}</div>
                                            <div class="col-span-6 min-h-5 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.undertime.minutes }}</div>
                                        </div>
                                    </div>

                                    <div v-if="scheduleBiometrics.scheduleCategory === 'toMidnight'"
                                        class="grid grid-cols-12">
                                        <div class="col-span-1 row-span-2 border-b-2 border-r-2 border-slate-600 flex items-center justify-center">
                                            {{ scheduleBiometrics.scheduleSlots.dayNo }}
                                        </div>
                                        <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600"></div>
                                            <div class="col-span-6 min-h-5"></div>
                                        </div>
                                        <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.firstDay.pm.in }}</div>
                                            <div class="col-span-6 min-h-5 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.firstDay.pm.out }}</div>
                                        </div>
                                        <div class="col-span-3 row-span-2 border-b-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 border-r-2 border-slate-600 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.undertime.hours }}</div>
                                            <div class="col-span-6 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.undertime.minutes }}</div>
                                        </div>

                                        <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600"></div>
                                            <div class="col-span-6 min-h-5 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.secondDay.am.out }}</div>
                                        </div>
                                        <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600"></div>
                                            <div class="col-span-6 min-h-5"></div>
                                        </div>
                                    </div>

                                    <div v-if="scheduleBiometrics.scheduleCategory === 'twoDays'"
                                        class="grid grid-cols-12">
                                        <div class="col-span-1 row-span-2 border-b-2 border-r-2 border-slate-600 flex items-center justify-center">
                                            {{ scheduleBiometrics.scheduleSlots.dayNo }}
                                        </div>
                                        <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600"></div>
                                            <div class="col-span-6 min-h-5"></div>
                                        </div>
                                        <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.firstDay.pm.in }}</div>
                                            <div class="col-span-6 min-h-5 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.firstDay.pm.out }}</div>
                                        </div>
                                        <div class="col-span-3 row-span-2 border-b-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 border-r-2 border-slate-600 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.undertime.hours }}</div>
                                            <div class="col-span-6 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.undertime.minutes }}</div>
                                        </div>

                                        <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.secondDay.am.in }}</div>
                                            <div class="col-span-6 min-h-5 flex items-center justify-center">{{ scheduleBiometrics.scheduleSlots.secondDay.am.out }}</div>
                                        </div>
                                        <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600"></div>
                                            <div class="col-span-6 min-h-5"></div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div class="border-b-2 border-slate-600 w-full grid grid-cols-12">
                                <div class="col-span-12 flex items-center justify-center font-medium">TOTAL</div>
                            </div>
                        </div>
                    </div>



                    <div class="grid grid-cols-12">
                        <div class="col-span-4">
                            <span class="font-medium">[daily_time_record.groupedSchedules]</span>
                            <pre v-if="daily_time_record.groupedSchedules ">{{ daily_time_record.groupedSchedules }}</pre>
                            <Divider />
                            <span class="font-medium">[daily_time_record.schedules]</span>
                            <pre v-if="daily_time_record.schedules" class="col-span-12">{{ daily_time_record.schedules }}</pre>
                        </div>
                        <div class="col-span-4">
                            <span class="font-medium">[daily_time_record.groupedBiometrics]</span>
                            <pre v-if="daily_time_record.groupedBiometrics">{{ daily_time_record.groupedBiometrics }}</pre>
                            <Divider />
                            <span class="font-medium">[daily_time_record.biometrics]</span>
                            <pre v-if="daily_time_record.biometrics" class="col-span-12">{{ daily_time_record.biometrics }}</pre>
                        </div>
                        <div class="col-span-4">
                            <span class="font-medium">[daily_time_record.testGroupings]</span>
                            <pre v-if="daily_time_record.testGroupings" class="col-span-12">{{ daily_time_record.testGroupings }}</pre>
                        </div>
                    </div>
                </div>

                <div class="col-span-6 md:col-span-2">
                    <Listbox :options="daily_time_record.groupedSchedules" optionLabel="scheduleDate"
                        optionGroupChildren="schedules" optionGroupLabel="schedules.scheduleName"
                        emptyMessage="No assigned schedules"
                        disabled
                        class="w-full text-sm pa-0">
                        <template #header>
                            <div class="flex items-center justify-center w-full h-6">Schedules</div>
                        </template>
                        <template #optiongroup="slotProps">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-1">
                                    <i class="pi pi-calendar" style="font-size: 0.85rem"></i>
                                    <p>{{ moment(slotProps.option.scheduleDate).format("MMMM D, YYYY") }}</p>
                                </div>
                                <p>{{ moment(slotProps.option.scheduleDate).format("dddd") }}</p>
                            </div>
                        </template>
                        <template #option="slotProps">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-1">
                                    <i class="pi pi-bookmark" style="font-size: 0.85rem"></i>
                                    <p>{{ slotProps.option.schedules.scheduleName }}</p>
                                </div>
                            </div>
                        </template>
                    </Listbox>
                </div>
                <div class="col-span-6 md:col-span-2">
                    <Listbox :options="daily_time_record.groupedBiometrics" optionLabel="checkDate"
                        optionGroupChildren="biometrics" optionGroupLabel="checkTime"
                        emptyMessage="No biometrics data"
                        disabled
                        class="w-full text-sm pa-0">
                        <template #header>
                            <div class="flex items-center justify-center w-full h-6">Biometrics In & Out</div>
                        </template>
                        <template #optiongroup="slotProps">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-1">
                                    <i class="pi pi-calendar" style="font-size: 0.85rem"></i>
                                    <p>{{ moment(slotProps.option.checkDate).format("MMMM D, YYYY") }}</p>
                                </div>
                                <p>{{ moment(slotProps.option.checkDate).format("dddd") }}</p>
                            </div>
                        </template>
                        <template #option="slotProps">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-1">
                                    <i class="pi pi-clock" style="font-size: 0.85rem"></i>
                                    <p>{{ moment(slotProps.option.checkTime).format('hh:mm A') }}</p>
                                </div>
                                <div class="flex items-center gap-1">
                                    <p class="capitalize">{{ slotProps.option.checkType }}</p>
                                    <i class="pi pi-sign-in" style="font-size: 0.85rem"></i>
                                </div>
                            </div>
                        </template>
                    </Listbox>
                </div>
            </div>
        </Dialog>
    </div>
</template>