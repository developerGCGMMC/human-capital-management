<script setup>
    definePageMeta({
        layout: 'panel'
    });

    import moment from 'moment';

    const user = useSupabaseUser();

    import { useToast } from 'primevue/usetoast';
    const toast = useToast();

    const { generateDailyTimeRecordPDF } = useDailyTimeRecord();

    // ! ----------------------------------------------------------------------------------------------------

    const pendings = reactive({
        fetch_employee_biometrics: false,

        download_dtr: false
    });

    // ! ----------------------------------------------------------------------------------------------------

    const range_group = ref('whole');

    const date_used = ref(moment().startOf('month').format('YYYY-MM-DD'));
    const date_range = reactive({
        from: moment().startOf('month').format('YYYY-MM-DD'),
        to: moment().endOf('month').format('YYYY-MM-DD')
    });

    // ! ----------------------------------------------------------------------------------------------------

    const forms = reactive({
        range_year_month: moment().format('MM/YYYY'),

        range_casual_with_appointment: 'first',
        range_contract_of_service: 'current'
    });
    const form_options = reactive({
        range_casual_with_appointment: [
            {
                label: moment().date(1).format('MMM D')+' - '+moment().date(15).format('MMM D'),
                value: 'first'
            },
            {
                label: moment().date(16).format('MMM D')+' - '+moment().endOf('month').format('MMM D'),
                value: 'second'
            }
        ],
        range_contract_of_service: [
            {
                label: moment().subtract(1, 'months').date(21).format('MMM D')+' - '+moment().date(4).format('MMM D'),
                value: 'previous'
            },
            {
                label: moment().date(5).format('MMM D')+' - '+moment().date(20).format('MMM D'),
                value: 'current'
            },
            {
                label: moment().date(21).format('MMM D')+' - '+moment().add(1, 'months').date(4).format('MMM D'),
                value: 'next'
            }
        ]
    });

    // ! ----------------------------------------------------------------------------------------------------

    const onUpdateCalendar = (event) => {
        // console.log('[onUpdateCalendar] event: '+moment(event).format('YYYY-MM-DD'));

        date_used.value = moment(event).startOf('month').format('YYYY-MM-DD');

        forms.range_year_month = moment(event).format('MM/YYYY');

        form_options.range_casual_with_appointment = form_options.range_casual_with_appointment.reduce((accumulatior, currentOption) => {
            if(currentOption.value === 'first') {
                accumulatior.push({
                    label: moment(event).date(1).format('MMM D')+' - '+moment(event).date(15).format('MMM D'),
                    value: currentOption.value
                });
            } else {
                accumulatior.push({
                    label: moment(event).date(16).format('MMM D')+' - '+moment(event).endOf('month').format('MMM D'),
                    value: currentOption.value
                });
            }

            return accumulatior;
        }, []);
        form_options.range_contract_of_service = form_options.range_contract_of_service.reduce((accumulator, currentOption) => {
            if(currentOption.value === 'previous') {
                accumulator.push({
                    label: moment(event).subtract(1, 'months').date(21).format('MMM D')+' - '+moment(event).date(4).format('MMM D'),
                    value: currentOption.value
                });
            }
            if(currentOption.value === 'current') {
                accumulator.push({
                    label: moment(event).date(5).format('MMM D')+' - '+moment(event).date(20).format('MMM D'),
                    value: currentOption.value
                });
            }
            if(currentOption.value === 'next') {
                accumulator.push({
                    label: moment(event).date(21).format('MMM D')+' - '+moment(event).add(1, 'months').date(4).format('MMM D'),
                    value: currentOption.value
                });
            }

            return accumulator;
        }, []);

        range_group.value = 'whole';
        date_range.from = moment(event).startOf('month').format('YYYY-MM-DD');
        date_range.to = moment(event).endOf('month').format('YYYY-MM-DD');

        setTimeout(() => {
            fetchEmployeeBiometrics();
        }, 200);
    };

    const onUpdateRangeCasualWithAppointment = (event) => {
        // console.log('[onUpdateRangeCasualWithAppointment] event: '+event);

        range_group.value = event;

        if(event === 'first') {
            date_range.from = moment(date_used.value).startOf('month').format('YYYY-MM-DD');
            date_range.to = moment(date_used.value).date(15).format('YYYY-MM-DD');
        } else {
            date_range.from = moment(date_used.value).date(16).format('YYYY-MM-DD');
            date_range.to = moment(date_used.value).endOf('month').format('YYYY-MM-DD');
        }

        setTimeout(() => {
            fetchEmployeeBiometrics();
        }, 200);
    };
    const onUpdateRangeContractOfService = (event) => {
        // console.log('[onUpdateRangeContractOfService] event: '+event);

        range_group.value = event;

        if(event === 'previous') {
            date_range.from = moment(date_used.value).subtract(1, 'months').date(21).format('YYYY-MM-DD');
            date_range.to = moment(date_used.value).date(4).format('YYYY-MM-DD');
        }
        if(event === 'current') {
            date_range.from = moment(date_used.value).date(5).format('YYYY-MM-DD');
            date_range.to = moment(date_used.value).date(20).format('YYYY-MM-DD');
        }
        if(event === 'next') {
            date_range.from = moment(date_used.value).date(21).format('YYYY-MM-DD');
            date_range.to = moment(date_used.value).add(1, 'months').date(4).format('YYYY-MM-DD');
        }

        setTimeout(() => {
            fetchEmployeeBiometrics();
        }, 200);
    };

    // ! ----------------------------------------------------------------------------------------------------

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

    const { execute: fetchEmployeeBiometrics } = useFetch('/api/employees/biometrics', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        query: {
            fetch_by: 'user',
            user_id: user?.value?.id ?? null,

            date_from: computed(() => date_range.from),
            date_to: computed(() => date_range.to),

            range_group: range_group
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

    const processDailyTimeRecordPDF = async () => {
        pendings.download_dtr = true;

        toast.add({
            severity: 'info',
            summary: 'Download',
            detail: 'Downloading..',
            life: 10000
        });

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

        await fetchEmployeeBiometrics();
    });
</script>
<template>
    <Toast />

    <div class="container p-4">
        <Panel style="background-color: var(--surface-50);">
            <template #header>
                <div class="flex items-center gap-2">
                    <Avatar icon="pi pi-book" size="large" style="background-color: var(--surface-0); color: var(--primary-500);" />
                    <span class="p-text-secondary">Daily Time Record</span>
                </div>
            </template>

            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-9 order-last md:order-first w-full flex flex-col gap-4">
                    <div class="container p-4 grid grid-cols-12 gap-1 border rounded-lg bg-white text-sm">
                        <div v-if="pendings.fetch_employee_biometrics" class="col-span-12">
                            <ProgressBar mode="indeterminate" style="height: 4px" />
                        </div>

                        <div class="col-span-12 md:col-span-4">
                            <PreviewDailyTimeRecord :daily_time_record="daily_time_record" />
                        </div>
                        <div class="col-span-12 md:col-span-8 grid grid-cols-12 gap-1">
                            <div class="col-span-6 md:col-span-4">
                                <ListboxGroupedSchedules :daily_time_record="daily_time_record" />
                            </div>
                            <div class="col-span-6 md:col-span-4">
                                <ListboxGroupedBiometricsInOut :daily_time_record="daily_time_record" />
                            </div>
                            <div class="col-span-6 md:col-span-4">
                                <ListboxGroupedHolidays :daily_time_record="daily_time_record" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-span-12 md:col-span-3 order-first md:order-last w-full">
                    <div class="container p-4 grid grid-cols-12 gap-1 border rounded-lg bg-white p-fluid">
                        <!-- <div class="col-span-12 p-fluid">
                            <p>Date Used: {{ date_used }}</p>
                            <p>[{{ date_range.from }} - {{ date_range.to }}]</p>
                            <p>{{ forms.range_year_month }}</p>
                            <p>forms.range_casual_with_appointment: {{ forms.range_casual_with_appointment }}</p>
                            <p>forms.range_contract_of_service: {{ forms.range_contract_of_service }}</p>
                            <p>form_options.range_contract_of_service: {{ form_options.range_contract_of_service }}</p>
                        </div> -->

                        <div class="col-span-10 p-fluid">
                            <Calendar v-model="forms.range_year_month"
                                @update:modelValue="onUpdateCalendar($event)"
                                :disabled="pendings.fetch_employee_biometrics"
                                view="month" dateFormat="mm/yy" showIcon />
                        </div>
                        <div class="col-span-2">
                            <Button @click="processDailyTimeRecordPDF()" icon="pi pi-download" class="w-full" />
                        </div>

                        <div class="col-span-12">
                            <SelectButton v-model="forms.range_casual_with_appointment"
                                @update:modelValue="onUpdateRangeCasualWithAppointment($event)"
                                :options="form_options.range_casual_with_appointment" optionLabel="label" optionValue="value"
                                :allow-empty=false />
                        </div>

                        <div class="col-span-12">
                            <SelectButton v-model="forms.range_contract_of_service"
                                @update:modelValue="onUpdateRangeContractOfService($event)"
                                :options="form_options.range_contract_of_service" optionLabel="label" optionValue="value"
                                :allow-empty=false />
                        </div>
                    </div>
                </div>
            </div>
        </Panel>
    </div>
</template>