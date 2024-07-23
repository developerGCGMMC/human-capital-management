<script setup>
    definePageMeta({
        layout: 'panel'
    });

    import moment from 'moment';

    const user = useSupabaseUser();

    const { generateDailyTimeRecordPDF } = useDailyTimeRecord();

    import { useConfirm } from "primevue/useconfirm";
    const confirm = useConfirm();
    import { useToast } from 'primevue/usetoast';
    const toast = useToast();

    // ! ----------------------------------------------------------------------------------------------------

    const pendings = reactive({
        fetch_services_offices_employees: false,
        fetch_appointment_status: false,
        fetch_schedules: false,

        insert_schedule: false,
        fetch_schedule: false,
        delete_schedule: false,

        fetch_employee_biometrics: false,

        download_dtr: false
    });

    // ! ----------------------------------------------------------------------------------------------------

    const original_data = reactive({
        office_employees: []
    });

    const forms = reactive({
        selected_office_ids: [],
        selected_appointment_id: null,
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
        ],
        appointment_id: []
    };
    const form_multiselect_options = reactive({
        schedules: [],
        service_offices: [],
        office_employees: []
    });

    // ! ----------------------------------------------------------------------------------------------------

    const results = reactive({
        selected_employees: []
    });

    // ! ----------------------------------------------------------------------------------------------------

    const { execute: fetchServicesOfficesEmployees } = await useFetch('/api/services/offices/employees', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        immediate: false,
        watch: false,

        async onRequest() {
            pendings.fetch_services_offices_employees = true;
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
            // console.log('[onResponse] fetchServicesOffices: '+JSON.stringify(response._data));

            original_data.office_employees = response._data.office_employees;

            form_multiselect_options.service_offices = response._data.service_offices;
            form_multiselect_options.office_employees = response._data.office_employees;

            setTimeout(() => {
                pendings.fetch_services_offices_employees = false;
            }, 500);
        },
        // async onResponseError({ response }) {
        //     toast.add({
        //         severity: 'error',
        //         summary: 'Error',
        //         detail: '[Fetch Response Error] '+response.status+': '+response.statusText,
        //         life: 5000
        //     });
        // }
    });

    // ! ----------------------------------------------------------------------------------------------------

    const { execute: fetchAppointmentStatus } = await useFetch('/api/appointment-status', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        immediate: false,
        watch: false,

        async onRequest() {
            pendings.fetch_appointment_status = true;
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
            // console.log('[onResponse] fetchAppointmentStatus: '+JSON.stringify(response._data));

            form_dropdown_options.appointment_id = response._data;

            setTimeout(() => {
                pendings.fetch_appointment_status = false;
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
    const { execute: fetchSchedules } = await useFetch('/api/schedules', {
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
        date_range.from = moment().startOf('month').format('YYYY-MM-DD');
        date_range.to = moment().endOf('month').format('YYYY-MM-DD');

        forms.selected_office_ids = [];
        forms.selected_employees = [];
        form_multiselect_options.office_employees = original_data.office_employees;

        results.selected_employees = [];

        forms.selected_dates = [];
        forms.selected_day_type = null;

        forms.selected_employee_schedules = [];
    };

    // ! ----------------------------------------------------------------------------------------------------

    const onChangeDayType = () => {
        forms.selected_schedules = [];
    };

    // ! ----------------------------------------------------------------------------------------------------

    const calendar_settings = reactive({
        year: moment().format('YYYY'),
        month: moment().format('MM')
    });

    const date_range = reactive({
        from: moment().startOf('month').format('YYYY-MM-DD'),
        to: moment().endOf('month').format('YYYY-MM-DD')
    });

    // ! ----------------------------------------------------------------------------------------------------

    const processEmployeeSchedule = () => {
        toast.add({
            severity: 'info',
            summary: 'Processing',
            detail: 'Assigning schedule..',
            life: 6000
        });

        if(!forms.selected_employees || !forms.selected_dates || !forms.selected_schedules || !forms.selected_day_type) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Missing fields',
                life: 5000
            });

            return false;
        }

        insertEmployeeSchedule();
    };

    const { execute: insertEmployeeSchedule } = useFetch('/api/employees/schedules', {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: {
            user_id: user?.value?.id ?? null,
            selected_employee_ids: computed(() => forms.selected_employees.reduce((accumulator, currentEmployee) => {
                accumulator.push(currentEmployee.id);

                return accumulator;
            }, [])),
            selected_dates: computed(() => {
                return forms.selected_dates.reduce((accumulator, currentDate) => {
                    accumulator.push(moment(currentDate).format('YYYY-MM-DD'));

                    return accumulator;
                }, []);
            }),
            selected_schedule_ids: computed(() => forms.selected_schedules),
            date_range: date_range
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
            // console.log('[onResponse] insertEmployeeSchedule: '+JSON.stringify(response._data));

            setTimeout(() => {
                pendings.insert_schedule = false;
            }, 1000);

            toast.removeAllGroups();

            results.selected_employees = forms.selected_employees.reduce((accumulator, currentEmployee) => {
                accumulator.push({
                    ...currentEmployee,
                    groupedEmployeeSchedules: response._data.reduce((accumulator, currentEmployeeSchedule) => {
                        if(currentEmployeeSchedule.id === currentEmployee.id) {
                            accumulator = currentEmployeeSchedule.groupedEmployeeSchedules;
                        }

                        return accumulator;
                    }, [])
                });

                return accumulator;
            }, []);

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

    const responseFetch_fetchEmployeeSchedules = ref([]);

    const { execute: fetchEmployeeSchedules } = useFetch('/api/employees/schedules', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json'
        },
        body: {
            user_id: user?.value?.id ?? null,
            selected_employee_ids: computed(() => forms.selected_employees.reduce((accumulator, currentEmployee) => {
                accumulator.push(currentEmployee.id);

                return accumulator;
            }, [])),
            date_range: date_range
        },
        immediate: false,
        watch: false,

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
            // console.log('[onResponse] fetchEmployeeSchedules: '+JSON.stringify(response._data));

            setTimeout(() => {
                pendings.fetch_schedule = false;
            }, 1000);

            responseFetch_fetchEmployeeSchedules.value = response._data;

            results.selected_employees = forms.selected_employees.reduce((accumulator, currentEmployee) => {
                accumulator.push({
                    // ! from form.selected_employees
                    ...currentEmployee,
                    // ! add Object from fetch response
                    groupedEmployeeSchedules: response._data.reduce((accumulator, currentEmployeeSchedule) => {
                        if(currentEmployeeSchedule.id === currentEmployee.id) {
                            accumulator = currentEmployeeSchedule.groupedEmployeeSchedules;
                        }

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

    const { execute: deleteEmployeeSchedules } = useFetch('/api/employees/schedules', {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json'
        },
        body: {
            user_id: user?.value?.id ?? null,
            selected_employee_ids: computed(() => forms.selected_employees.reduce((accumulator, currentEmployee) => {
                accumulator.push(currentEmployee.id);

                return accumulator;
            }, [])),
            selected_employee_schedule_ids: computed(() => forms.selected_employee_schedules),
            date_range: date_range
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
            // console.log('[onResponse] deleteEmployeeSchedules: '+JSON.stringify(response._data));

            setTimeout(() => {
                pendings.delete_schedule = false;
            }, 1000);

            toast.removeAllGroups();

            results.selected_employees = forms.selected_employees.reduce((accumulator, currentEmployee) => {
                accumulator.push({
                    ...currentEmployee,
                    groupedEmployeeSchedules: response._data.reduce((accumulator, currentEmployeeSchedule) => {
                        if(currentEmployeeSchedule.id === currentEmployee.id) {
                            accumulator = currentEmployeeSchedule.groupedEmployeeSchedules;
                        }

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
        preview_daily_time_record: false
    });

    const selected_employee_id = ref(null);

    const daily_time_record = reactive({
        employeeDetail: {
            lastName: null,
            firstName: null,
            employeeID: null,
            biometricsNo: null,
            serviceID: null,
            sectionID: null,
            unitID: null,

            fullName: null,
            displayName: null,
        },

        groupedSchedules: [],
        groupedBiometrics: [],
        groupedHolidays: [],

        scheduleComputations: [],

        previewBody: [],
        pdfBody: [],

        settings: {
            date_range: {
                from: null,
                to: null
            },
            range_group: null
        },

        file: {
            name: null,
            header: {
                month: null
            },
            footer: {
                service_signatory: null
            }
        }
    });
    const clearDailyTimeRecord = () => {
        daily_time_record.employeeDetail.lastName = null;
        daily_time_record.employeeDetail.firstName = null;
        daily_time_record.employeeDetail.employeeID = null;
        daily_time_record.employeeDetail.biometricsNo = null;
        daily_time_record.employeeDetail.serviceID = null;
        daily_time_record.employeeDetail.sectionID = null;
        daily_time_record.employeeDetail.unitID = null;

        daily_time_record.employeeDetail.fullName = null;
        daily_time_record.employeeDetail.displayName = null;

        daily_time_record.groupedSchedules = [];
        daily_time_record.groupedBiometrics = [];
        daily_time_record.groupedHolidays = [];

        daily_time_record.scheduleComputations = [];

        daily_time_record.previewBody = [];
        daily_time_record.pdfBody = [];

        daily_time_record.settings.date_range.from = null;
        daily_time_record.settings.date_range.to = null;
        daily_time_record.settings.range_group = null;

        daily_time_record.file.name = null;
        daily_time_record.file.header.month = null;
        daily_time_record.file.footer.service_signatory = null;
    };

    const processDailyTimeRecordPreview = async (employee_id) => {
        visible.preview_daily_time_record = true;

        clearDailyTimeRecord();
        selected_employee_id.value = employee_id;
        await fetchEmployeeBiometrics();
    };

    const { execute: fetchEmployeeBiometrics } = useFetch('/api/employees/biometrics', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        query: {
            fetch_by: 'employee',
            user_id: user?.value?.id ?? null,
            selected_employee_id: selected_employee_id,

            date_from: computed(() => date_range.from),
            date_to: computed(() => date_range.to)
        },
        immediate: false,
        watch: false,

        async onRequest() {
            pendings.fetch_employee_biometrics = true;
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

            pendings.fetch_employee_biometrics = false;

            daily_time_record.employeeDetail.lastName = response._data.employeeDetail.lastName;
            daily_time_record.employeeDetail.firstName = response._data.employeeDetail.firstName;
            daily_time_record.employeeDetail.employeeID = response._data.employeeDetail.employeeID;
            daily_time_record.employeeDetail.biometricsNo = response._data.employeeDetail.biometricsNo;
            daily_time_record.employeeDetail.serviceID = response._data.employeeDetail.serviceID;
            daily_time_record.employeeDetail.sectionID = response._data.employeeDetail.sectionID;
            daily_time_record.employeeDetail.unitID = response._data.employeeDetail.unitID;

            daily_time_record.employeeDetail.fullName = response._data.employeeDetail.fullName;
            daily_time_record.employeeDetail.displayName = response._data.employeeDetail.displayName;

            daily_time_record.groupedSchedules = response._data.groupedSchedules;
            daily_time_record.groupedBiometrics = response._data.groupedBiometrics;
            daily_time_record.groupedHolidays = response._data.groupedHolidays;

            daily_time_record.scheduleComputations = response._data.scheduleComputations;

            daily_time_record.previewBody = response._data.previewBody;
            daily_time_record.pdfBody = response._data.pdfBody;

            daily_time_record.settings.date_range.from = response._data.settings.date_range.from;
            daily_time_record.settings.date_range.to = response._data.settings.date_range.to;
            daily_time_record.settings.range_group = response._data.settings.range_group;

            daily_time_record.file.name = response._data.file.name;
            daily_time_record.file.header.month = response._data.file.header.month;
            daily_time_record.file.footer.service_signatory = response._data.file.footer.service_signatory;
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

    const results_panel = reactive({
        view: 'grid',
        date: {
            from: computed(() => calendar_settings.year+'-'+calendar_settings.month+'-01'),
            to: computed(() => calendar_settings.year+'-'+calendar_settings.month+'-'+moment(calendar_settings.year+'-'+calendar_settings.month).daysInMonth())
        }
    });

    const results_tmenu = ref();
    const results_tmenu_items = ref([
        {
            label: 'Grid View',
            icon: 'pi pi-th-large',
            command: () => {
                results_panel.view = 'grid';
                results_panel.date.from = computed(() => calendar_settings.year+'-'+calendar_settings.month+'-01');
                results_panel.date.to = computed(() => calendar_settings.year+'-'+calendar_settings.month+'-'+moment(calendar_settings.year+'-'+calendar_settings.month).daysInMonth());
            }
        },
        {
            label: 'Table View',
            icon: 'pi pi-bars',
            items: [
                {
                    label: '1st Quincena',
                    icon: 'pi pi-calendar',
                    command: () => {
                        results_panel.view = 'first_quincena';
                        results_panel.date.from = computed(() => calendar_settings.year+'-'+calendar_settings.month+'-01');
                        results_panel.date.to = computed(() => calendar_settings.year+'-'+calendar_settings.month+'-15');
                    }
                },
                {
                    label: '2nd Quincena',
                    icon: 'pi pi-calendar',
                    command: () => {
                        results_panel.view = 'second_quincena';
                        results_panel.date.from = computed(() => calendar_settings.year+'-'+calendar_settings.month+'-16');
                        results_panel.date.to = computed(() => calendar_settings.year+'-'+calendar_settings.month+'-'+moment(calendar_settings.year+'-'+calendar_settings.month).daysInMonth());
                    }
                }
            ]
        }
    ]);

    // ! ----------------------------------------------------------------------------------------------------

    const quincena_results = computed(() => {
        const from_day = moment(results_panel.date.from).format('D');
        const to_day = moment(results_panel.date.to).format('D');
        const year_used = moment(results_panel.date.from).format('YYYY');
        const month_used = moment(results_panel.date.from).format('MM');
        const quincenaDays = [];

        for(let x = from_day; x <= to_day; x++) {
            quincenaDays.push(moment(year_used+'-'+month_used+'-'+x).format('YYYY-MM-DD'));
        }

        return (results_panel.view === 'first_quincena' || results_panel.view === 'second_quincena')
            ? results.selected_employees.reduce((accumulator, selectedEmployee) => {
                accumulator.push({
                    id: selectedEmployee.id,
                    fullName: selectedEmployee.fullName,
                    quincenaSlots: quincenaDays.reduce((accumulator, currentDate) => {
                        accumulator.push({
                            scheduleDate: currentDate,
                            schedules: selectedEmployee.groupedEmployeeSchedules.reduce((accumulator, currentEmployeeSchedule) => {
                                if(currentEmployeeSchedule.scheduleDate === currentDate) {
                                    accumulator = currentEmployeeSchedule.schedules.reduce((accumulator, currentSchedule) => {
                                        accumulator.push(currentSchedule);

                                        return accumulator;
                                    }, []);
                                }

                                return accumulator;
                            }, [])
                        });

                        return accumulator;
                    }, [])
                });

                return accumulator;
            }, [])
            : [];
    });

    // ! ----------------------------------------------------------------------------------------------------

    const onChange_selectedOfficeIDs = (event) => {
        // console.log('[onChange_selectedOfficeIDs] $event: '+JSON.stringify(selected_office_ids));

        const selected_office_ids = event.value;
        const selected_appointment_id = forms.selected_appointment_id;

        if(forms.selected_office_ids.length == 0) {
            forms.selected_appointment_id = null;
        }

        if(selected_office_ids.length != 0) {
            form_multiselect_options.office_employees = original_data.office_employees.reduce((accumulator, originalOffice) => {
                if(selected_office_ids.includes(originalOffice.sectionID) || selected_office_ids.includes(originalOffice.unitID)) {
                    accumulator.push({
                        ...originalOffice,
                        employees: selected_appointment_id
                            ? originalOffice.employees.reduce((accumulator, currentEmployee) => {
                                if(currentEmployee.appointmentID === selected_appointment_id) {
                                    accumulator.push(currentEmployee);
                                }

                                return accumulator;
                            }, [])
                            : originalOffice.employees
                    });
                }

                return accumulator;
            }, [])
            .sort((prev, next) => {
                return prev.isSectionHead < next.isSectionHead
                    ? 1
                    : (prev.isSectionHead > next.isSectionHead
                        ? -1
                        : (prev.officeName > next.officeName
                            ? 1
                            : (prev.officeName < next.officeName
                                ? -1
                                : 0)));
            });

            forms.selected_employees = forms.selected_employees.reduce((accumulator, currentEmployee) => {
                if(selected_office_ids.includes(currentEmployee.sectionID) || selected_office_ids.includes(currentEmployee.unitID)) {
                    accumulator.push(currentEmployee);
                }

                return accumulator;
            }, []);
            results.selected_employees = results.selected_employees.reduce((accumulator, currentEmployee) => {
                if(selected_office_ids.includes(currentEmployee.sectionID) || selected_office_ids.includes(currentEmployee.unitID)) {
                    accumulator.push(currentEmployee);
                }

                return accumulator;
            }, []);
        } else {
            form_multiselect_options.office_employees = original_data.office_employees;

            forms.selected_employees = [];
            results.selected_employees = [];
        }
    };
    const onChange_appointmentStatus = (event) => {
        // console.log('[onChange_appointmentStatus] $event: '+JSON.stringify(event.value));

        const selected_appointment_id = event.value;

        const selected_office_ids = forms.selected_office_ids;
        // console.log('selected_office_ids: '+JSON.stringify(selected_office_ids));

        if(selected_appointment_id) {
            form_multiselect_options.office_employees = original_data.office_employees.reduce((accumulator, originalOffice) => {
                if(selected_office_ids.includes(originalOffice.sectionID) || selected_office_ids.includes(originalOffice.unitID)) {
                    accumulator.push({
                        ...originalOffice,
                        employees: originalOffice.employees.reduce((accumulator, currentEmployee) => {
                            if(currentEmployee.appointmentID === selected_appointment_id) {
                                accumulator.push(currentEmployee);
                            }

                            return accumulator;
                        }, [])
                    });
                }

                return accumulator;
            }, [])
            .sort((prev, next) => {
                return prev.isSectionHead < next.isSectionHead
                    ? 1
                    : (prev.isSectionHead > next.isSectionHead
                        ? -1
                        : (prev.officeName > next.officeName
                            ? 1
                            : (prev.officeName < next.officeName
                                ? -1
                                : 0)));
            });

            forms.selected_employees = forms.selected_employees.reduce((accumulator, currentEmployee) => {
                if(currentEmployee.appointmentID === selected_appointment_id) {
                    accumulator.push(currentEmployee);
                }

                return accumulator;
            }, []);
            results.selected_employees = results.selected_employees.reduce((accumulator, currentEmployee) => {
                if(currentEmployee.appointmentID === selected_appointment_id) {
                    accumulator.push(currentEmployee);
                }

                return accumulator;
            }, []);
        } else {
            // Same as onChange_selectedOfficeIDs
            if(selected_office_ids.length != 0) {
                form_multiselect_options.office_employees = original_data.office_employees.reduce((accumulator, originalOffice) => {
                    if(selected_office_ids.includes(originalOffice.sectionID) || selected_office_ids.includes(originalOffice.unitID)) {
                        accumulator.push(originalOffice);
                    }

                    return accumulator;
                }, [])
                .sort((prev, next) => {
                    return prev.isSectionHead < next.isSectionHead
                        ? 1
                        : (prev.isSectionHead > next.isSectionHead
                            ? -1
                            : (prev.officeName > next.officeName
                                ? 1
                                : (prev.officeName < next.officeName
                                    ? -1
                                    : 0)));
                });

                forms.selected_employees = forms.selected_employees.reduce((accumulator, currentEmployee) => {
                    if(selected_office_ids.includes(currentEmployee.sectionID) || selected_office_ids.includes(currentEmployee.unitID)) {
                        accumulator.push(currentEmployee);
                    }

                    return accumulator;
                }, []);
                results.selected_employees = results.selected_employees.reduce((accumulator, currentEmployee) => {
                    if(selected_office_ids.includes(currentEmployee.sectionID) || selected_office_ids.includes(currentEmployee.unitID)) {
                        accumulator.push(currentEmployee);
                    }

                    return accumulator;
                }, []);
            } else {
                form_multiselect_options.office_employees = original_data.office_employees;

                forms.selected_employees = [];
                results.selected_employees = [];
            }
        }

        // console.log('form_multiselect_options.office_employees: '+JSON.stringify(form_multiselect_options.office_employees));
    };
    const onChange_selectedEmployees = (event) => {
        // console.log('[onChange_selectedEmployees] $event: '+JSON.stringify(event.value));

        fetchEmployeeSchedules();
    };

    // ! ----------------------------------------------------------------------------------------------------

    const removeSelectedEmployee = (selected_employee_id) => {
        forms.selected_employees = forms.selected_employees.reduce((accumulator, currentEmployee) => {
            if(currentEmployee.id != selected_employee_id) {
                accumulator.push(currentEmployee);
            }

            return accumulator;
        }, []);
        results.selected_employees = results.selected_employees.reduce((accumulator, currentEmployee) => {
            if(currentEmployee.id != selected_employee_id) {
                accumulator.push(currentEmployee);
            }

            return accumulator;
        }, []);
    };

    // ! ----------------------------------------------------------------------------------------------------

    let on_month_change_timer;
    const onMonthChangeCalendar = (event) => {
        // console.log('[onMonthChangeCalendar] $event: '+JSON.stringify(event));

        let year = String(event.year);
        let month = String(event.month).padStart(2, '0');

        date_range.from = moment(year+'-'+month+'-01').startOf('month').format('YYYY-MM-DD');
        date_range.to = moment(year+'-'+month+'-01').endOf('month').format('YYYY-MM-DD');

        clearTimeout(on_month_change_timer);

        on_month_change_timer = setTimeout(() => {
            calendar_settings.year = year;
            calendar_settings.month = month;

            if(forms.selected_employees.length != 0) {
                fetchEmployeeSchedules();
            }
        }, 200);
    };

    // ! ----------------------------------------------------------------------------------------------------

    const processDailyTimeRecordPDF = async (employee_id) => {
        pendings.download_dtr = true;

        toast.add({
            severity: 'info',
            summary: 'Download',
            detail: 'Downloading DTR in pdf file...',
            life: 10000
        });

        clearDailyTimeRecord();
        selected_employee_id.value = employee_id;
        await fetchEmployeeBiometrics();

        pendings.download_dtr = await generateDailyTimeRecordPDF(daily_time_record);

        if(pendings.download_dtr === false) {
            toast.removeAllGroups();
        }
    };

    // ! ----------------------------------------------------------------------------------------------------

    onMounted(async () => {
        watchEffect(async () => {
            if(!user.value) {
                await navigateTo('/');
            }
        });

        fetchServicesOfficesEmployees();
        fetchAppointmentStatus();
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
                <Button @click="panel_menu_ref.toggle($event)" icon="pi pi-cog" outlined />
                <Menu ref="panel_menu_ref" :model="panel_menu.settings" :popup="true" />
            </template>

            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-9 order-last md:order-first w-full flex flex-col gap-4">
                    <div class="grid grid-cols-12 gap-2">
                        <div class="col-span-12 md:col-span-8 p-fluid">
                            <MultiSelect v-model="forms.selected_office_ids" :options="form_multiselect_options.service_offices" optionLabel="officeName" optionValue="officeID"
                                optionGroupLabel="officeName" optionGroupChildren="offices"
                                display="chip" placeholder="Office"
                                filter filterPlaceholder="Search" resetFilterOnHide highlightOnSelect
                                :loading="pendings.fetch_services_offices_employees" :disabled="pendings.fetch_services_offices_employees"
                                @change="onChange_selectedOfficeIDs($event)">
                                <template #optiongroup="slotProps">
                                    <div class="flex justify-between items-center">
                                        <div class="text-sm tracking-wider">{{ slotProps.option.serviceName }}</div>
                                        <i class="pi pi-sitemap" style="font-size: 0.90rem;" />
                                    </div>
                                </template>
                                <template #option="slotProps">
                                    <div class="w-full flex justify-between items-center">
                                        <div>{{ slotProps.option.officeName }}</div>
                                        <i v-if="slotProps.option.isServiceHead === 'true'" class="pi pi-share-alt" style="font-size: 0.90rem" />
                                        <i v-if="slotProps.option.isSectionHead === 'true'" class="pi pi-tag" style="font-size: 0.90rem" />
                                        <i v-if="slotProps.option.type === 'unit'" class="pi pi-tags" style="font-size: 0.90rem" />
                                    </div>
                                </template>
                                <template #footer>
                                    <div class="py-2 px-3">
                                        <span class="text-base">{{ forms.selected_office_ids?.length ? forms.selected_office_ids.length : '0' }} selected</span>
                                    </div>
                                </template>
                            </MultiSelect>
                        </div>

                        <div class="col-span-12 md:col-span-4 p-fluid">
                            <Dropdown v-model="forms.selected_appointment_id" :options="form_dropdown_options.appointment_id" optionValue="id" optionLabel="appointmentName"
                                :loading="pendings.fetch_appointment_status" :disabled="!forms.selected_office_ids.length"
                                @change="onChange_appointmentStatus($event)"
                                showClear placeholder="Appointment" />
                        </div>
                        <div class="col-span-12 md:col-span-12 p-fluid">
                            <MultiSelect v-model="forms.selected_employees" :options="form_multiselect_options.office_employees" optionLabel="fullName"
                                optionGroupLabel="officeName" optionGroupChildren="employees"
                                display="chip" placeholder="Employees"
                                filter filterPlaceholder="Search" resetFilterOnHide highlightOnSelect
                                :loading="pendings.fetch_services_offices_employees" :disabled="pendings.fetch_services_offices_employees"
                                @change="onChange_selectedEmployees($event)">
                                <template #optiongroup="slotProps">
                                    <div class="flex justify-between items-center">
                                        <div class="text-sm tracking-wider">{{ slotProps.option.officeName }}</div>
                                        <i v-if="slotProps.option.isServiceHead === 'true'" class="pi pi-share-alt" style="font-size: 0.90rem" />
                                        <i v-if="slotProps.option.isSectionHead === 'true'" class="pi pi-tag" style="font-size: 0.90rem" />
                                        <i v-if="slotProps.option.type === 'unit'" class="pi pi-tags" style="font-size: 0.90rem" />
                                    </div>
                                </template>
                                <template #option="slotProps">
                                    <div class="w-full flex justify-between items-center">
                                        <div>{{ slotProps.option.fullName }}</div>
                                    </div>
                                </template>
                                <template #footer>
                                    <div class="py-2 px-3">
                                        <span class="text-base">{{ forms.selected_employees?.length ? forms.selected_employees.length : '0' }} selected</span>
                                    </div>
                                </template>
                            </MultiSelect>
                        </div>
                    </div>

                    <div class="container p-4 grid grid-cols gap-0 border rounded-lg bg-white">
                        <Toolbar style="background-color: var(--surface-50);">
                            <template #start>
                                <Button @click="($event) => results_tmenu.toggle($event)"
                                    icon="pi pi-eye" outlined size="small"
                                    aria-haspopup="true" aria-controls="overlay_results_tmenu" />
                                <TieredMenu ref="results_tmenu" id="overlay_results_tmenu" :model="results_tmenu_items" popup />
                            </template>
                            <template #end>
                                <Button icon="pi pi-print" outlined size="small" />
                            </template>
                        </Toolbar>

                        <div v-if="results_panel.view === 'grid'">
                            <div v-if="results.selected_employees.length" class="grid grid-cols-1 md:grid-cols-4 gap-2 pt-2">
                                <Fieldset v-for="selected_employee in results.selected_employees" :key="selected_employee.id" style="background-color: var(--surface-50);">
                                    <template #legend>
                                        <div class="flex items-center pl-2 py-1 border border-amber-200 rounded-lg" style="background-color: var(--primary-50); color: var(--primary-500);">
                                            <Avatar :image="avatar_link+''+selected_employee.biometricsNo+'.jpg'" size="large" shape="circle" class="border" style="border-color: var(--primary-300);" />
                                            <span class="font-normal text-sm md:text-base">{{ selected_employee.lastName }}, {{ selected_employee.firstName }}</span>
                                        </div>
                                    </template>
                                    <div v-if="pendings.fetch_schedule" class="flex flex-col gap-2">
                                        <Skeleton height="23rem" />
                                    </div>
                                    <div v-else class="relative" style="height: 25.8rem;">
                                        <Listbox v-model="forms.selected_employee_schedules" :options="selected_employee.groupedEmployeeSchedules" optionLabel="scheduleDate" optionValue="id"
                                            optionGroupChildren="schedules" optionGroupLabel="scheduleName"
                                            multiple :virtualScrollerOptions="{ itemSize: 28 }"
                                            emptyMessage="No assigned schedule"
                                            class="w-full text-sm pa-0" listStyle="height:23rem">
                                            <template #optiongroup="slotProps">
                                                <div class="flex items-center justify-between">
                                                    <div class="flex items-center gap-1">
                                                        <i class="pi pi-calendar" style="font-size: 0.85rem" />
                                                        <p>{{ moment(slotProps.option.scheduleDate).format("MMMM D, YYYY") }}</p>
                                                    </div>
                                                    <p>{{ moment(slotProps.option.scheduleDate).format("dddd") }}</p>
                                                </div>
                                            </template>
                                            <template #option="slotProps">
                                                <div class="flex items-center justify-between">
                                                    <div class="flex items-center gap-1">
                                                        <i class="pi pi-clock" style="font-size: 0.85rem" />
                                                        <p>{{ slotProps.option.scheduleName }}</p>
                                                    </div>
                                                    <i v-if="forms.selected_employee_schedules.includes(slotProps.option.id)" class="pi pi-trash" style="font-size: 0.8rem"></i>
                                                </div>
                                            </template>
                                        </Listbox>
                                        <div class="absolute bottom-0 left-0 flex flex-wrap justify-between items-center w-full">
                                            <div class="flex items-center gap-1">
                                                <ButtonGroup>
                                                    <Button @click="processDailyTimeRecordPreview(selected_employee.id)" v-tooltip.bottom="{ value: 'Preview DTR', autoHide: false }" icon="pi pi-file-export" size="small" />
                                                    <Button @click="processDailyTimeRecordPDF(selected_employee.id)" v-tooltip.bottom="{ value: 'Generate PDF', autoHide: false }" icon="pi pi-file-pdf" size="small" outlined />
                                                </ButtonGroup>
                                                <Button @click="removeSelectedEmployee(selected_employee.id)" v-tooltip.bottom="{ value: 'Unselect employee', autoHide: false }" icon="pi pi-times" size="small" />
                                            </div>
                                            <div class="flex items-center">
                                                <ButtonGroup>
                                                    <Button @click="() => forms.selected_employee_schedules = []" v-tooltip.bottom="{ value: 'Unselect schedules', autoHide: false }" icon="pi pi-refresh" size="small" />
                                                    <Button @click="confirmDeleteEmployeeSchedules()" v-tooltip.right="{ value: 'Delete schedules', autoHide: false }" icon="pi pi-trash" :disabled="forms.selected_employee_schedules.length ? false : true" size="small" />
                                                </ButtonGroup>
                                            </div>
                                        </div>
                                    </div>
                                </Fieldset>
                            </div>
                            <div v-else>
                                <Message severity="secondary" icon="pi pi-exclamation-circle" :closable="false" class="mb-0">
                                    <span class="text-sm text-slate-500">No results.</span>
                                </Message>
                            </div>
                        </div>
                        <div v-else class="w-full flex flex-col border-t-2 border-l-2 border-slate-200 mt-2">
                            <div class="w-full grid grid-cols-12">
                                <div class="col-span-2 border-b-2 border-r-2 border-slate-200 py-2" />
                                <div class="col-span-10 flex">
                                    <div v-for="n in ((parseInt(moment(results_panel.date.to).format('D')) -  parseInt(moment(results_panel.date.from).format('D'))) + 1)"
                                        class="grow w-full border-b-2 border-r-2 border-slate-200 flex justify-center items-center">
                                        <span class="text-sm">
                                            {{ (n + parseInt(moment(results_panel.date.from).format('D'))) - 1 }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div v-for="quincena_result in quincena_results" :key="quincena_result.id"
                                class="w-full grid grid-cols-12">
                                <div class="col-span-2 border-b-2 border-r-2 border-slate-200 px-2 flex justify-start items-center">
                                    {{ quincena_result.fullName }}
                                </div>
                                <div class="col-span-10 flex">
                                    <div v-for="quincena_slot in quincena_result.quincenaSlots" :key="quincena_slot.id"
                                        class="grow w-full border-b-2 border-r-2 border-slate-200 flex flex-col justify-center items-center">
                                        <div v-for="schedule in quincena_slot.schedules" :key="schedule.id" class="text-xs">
                                            <span v-if="schedule.scheduleLegend && schedule.scheduleClass === 'text-blue-500'" class="text-blue-500">{{ schedule.scheduleLegend }}</span>
                                            <span v-else-if="schedule.scheduleLegend && schedule.scheduleClass === 'text-red-500'" class="text-red-500">{{ schedule.scheduleLegend }}</span>
                                            <span v-else class="text-surface-100">{{ schedule.shortName }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-span-12 md:col-span-3 order-first md:order-last w-full">
                    <div class="flex flex-col gap-5 border rounded-md p-4 p-4 bg-white text-sm">
                        <div class="flex flex-col gap-1 p-fluid">
                            <Calendar v-model="forms.selected_dates" dateFormat="yy-mm-dd" selectionMode="multiple"
                                :manualInput="false" inline
                                @month-change="onMonthChangeCalendar($event)"
                                class="w-full" />

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
                </div>
            </div>

            <template #footer>
                <div class="flex items-center justify-end gap-2">
                    <i class="pi pi-info-circle" style="background-color: var(--surface-0); color: var(--primary-500);" />
                    <span class="p-text-secondary text-wrap">Integrated Management Information Systems Section</span>
                </div>
            </template>
        </Panel>

        <Dialog v-model:visible="visible.preview_daily_time_record" modal maximizable
            :style="{ width: '100rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <template #header>
                <div class="flex items-center justify-center gap-2">
                    <Avatar v-if="daily_time_record.employeeDetail.biometricsNo" :image="avatar_link+''+daily_time_record.employeeDetail.biometricsNo+'.jpg'" size="xlarge" shape="circle" class="border-2" style="border-color: var(--primary-300);" />
                    <span v-if="daily_time_record.employeeDetail.displayName" class="text-lg font-semibold text-slate-500 tracking-wide">{{ daily_time_record.employeeDetail.displayName }} : {{ daily_time_record.employeeDetail.employeeID }}</span>
                </div>
            </template>

            <div class="grid grid-cols-12 w-full gap-1 text-sm">
                <div v-if="pendings.fetch_employee_biometrics" class="col-span-12">
                    <ProgressBar mode="indeterminate" style="height: 4px" />
                </div>

                <div class="col-span-12 md:col-span-8">
                    <div class="grid grid-cols-12 gap-2">
                        <div class="col-span-6">
                            <PreviewDailyTimeRecord :daily_time_record="daily_time_record" />
                        </div>
                        <div class="col-span-6">
                            <PreviewDailyTimeRecord :daily_time_record="daily_time_record" />
                        </div>
                    </div>
                </div>

                <div class="col-span-6 md:col-span-2 flex flex-col gap-1">
                    <ListboxGroupedSchedules :daily_time_record="daily_time_record" />
                    <ListboxGroupedHolidays :daily_time_record="daily_time_record" />
                </div>
                <div class="col-span-6 md:col-span-2">
                    <ListboxGroupedBiometricsInOut :daily_time_record="daily_time_record" />
                </div>
            </div>
        </Dialog>
    </div>
</template>