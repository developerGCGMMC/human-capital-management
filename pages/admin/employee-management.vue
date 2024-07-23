<script setup>
    definePageMeta({
        layout: 'panel'
    });

    const user = useSupabaseUser();

    const { toTitleCase } = useString();

    // ! ----------------------------------------------------------------------------------------------------

    const { pending, data: employees, refresh: refreshEmployees } = await useFetch('/api/employees', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        lazy: true
    });

    // ! ----------------------------------------------------------------------------------------------------

    const forms = reactive({
        selected_employee: {
            id: null,
            lastName: null,
            firstName: null,
            middleName: null,
            genealogySuffix: null,
            appointmentID: null,
            employeeID: null,
            biometricsNo: null,
            serviceID: null,
            sectionID: null,
            unitID: null
        }
    });
    const forms_autocomplete = reactive({
        selected_employee: {
            office_id: null
        }
    });

    // ! ----------------------------------------------------------------------------------------------------

    const table_dropdown_options = {
        employment_status: [
            { id: 'permanent', name: 'Permanent' },
            { id: 'casual_with_appointment', name: 'Casual with Appointment' },
            { id: 'contract_of_service', name: 'Contract of Service' },
            { id: 'job_order', name: 'Job Order' },
            { id: 'temporary', name: 'Temporary' }
        ],
        service_names: [],
        section_names: [],
        unit_names: []
    };

    const form_dropdown_options = {
        genealogy_suffix: ['Sr.', 'Jr.', 'II', 'III', 'IV'],
        employment_status: [
            { id: 'permanent', name: 'Permanent' },
            { id: 'casual_with_appointment', name: 'Casual with Appointment' },
            { id: 'contract_of_service', name: 'Contract of Service' },
            { id: 'job_order', name: 'Job Order' },
            { id: 'temporary', name: 'Temporary' }
        ],
        service_ids: [],
        section_ids: [],
        unit_ids: []
    };

    const form_autocomplete_suggestions = reactive({
        office_ids: []
    });

    const data_maps = {
        office_ids: [],
        office_map: []
    };

    const { data: data_offices } = await useFetch('/api/offices', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });

    table_dropdown_options.service_names = data_offices.value.service_names;
    table_dropdown_options.section_names = data_offices.value.section_names;
    table_dropdown_options.unit_names = data_offices.value.unit_names;

    form_dropdown_options.service_ids = data_offices.value.service_ids;
    form_dropdown_options.section_ids = data_offices.value.section_ids;
    form_dropdown_options.unit_ids = data_offices.value.unit_ids;

    form_autocomplete_suggestions.office_ids = data_offices.value.office_ids;

    data_maps.office_ids = data_offices.value.office_ids;
    data_maps.office_map = data_offices.value.office_map;

    // ! ----------------------------------------------------------------------------------------------------

    const image_placeholders = {
        table_profile: "https://res.cloudinary.com/dtcgyjwzt/image/upload/c_thumb,w_80,g_face/v1711015145/avatar/no-picture/blank.jpg"
    };

    // ! ----------------------------------------------------------------------------------------------------

    const onRowSelectEmployee = (event) => {
        forms.selected_employee.id = event.data.id;

        forms.selected_employee.lastName = event.data.lastName;
        forms.selected_employee.firstName = event.data.firstName;
        forms.selected_employee.middleName = event.data.middleName;
        forms.selected_employee.genealogySuffix = event.data.genealogySuffix;
        forms.selected_employee.appointmentID = event.data.appointmentID;
        forms.selected_employee.employeeID = event.data.employeeID;
        forms.selected_employee.biometricsNo = event.data.biometricsNo;
        forms.selected_employee.serviceID = event.data.serviceID;
        forms.selected_employee.sectionID = event.data.sectionID;
        forms.selected_employee.unitID = event.data.unitID;

        forms_autocomplete.selected_employee.office_id = data_maps.office_ids.reduce((accumulator, currentOffice) => {
            if(currentOffice.id === (event.data.unitID ?? event.data.sectionID)) {
                accumulator = currentOffice;
            }

            return accumulator;
        }, null);
    };
    const onRowUnselectEmployee = () => {
        forms.selected_employee.id = null;

        forms.selected_employee.lastName = null;
        forms.selected_employee.firstName = null;
        forms.selected_employee.middleName = null;
        forms.selected_employee.genealogySuffix = null;
        forms.selected_employee.appointmentID = null;
        forms.selected_employee.employeeID = null;
        forms.selected_employee.biometricsNo = null;
        forms.selected_employee.serviceID = null;
        forms.selected_employee.sectionID = null;
        forms.selected_employee.unitID = null;

        forms_autocomplete.selected_employee.office_id = null;
    };

    // ! ----------------------------------------------------------------------------------------------------

    import { FilterMatchMode } from 'primevue/api';

    const filters = ref();
    const initFilters = () => {
        filters.value = {
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            appointmentID: { value: null, matchMode: FilterMatchMode.EQUALS },
            'service.serviceName': { value: null, matchMode: FilterMatchMode.EQUALS },
            'section.sectionName': { value: null, matchMode: FilterMatchMode.EQUALS },
            'unit.unitName': { value: null, matchMode: FilterMatchMode.EQUALS }
        };
    };
    initFilters();

    // ! ----------------------------------------------------------------------------------------------------

    const onCompleteOfficeID = (event) => {
        setTimeout(() => {
            if(!event.query.trim().length) {
                form_autocomplete_suggestions.office_ids = [...data_maps.office_ids];
            } else {
                form_autocomplete_suggestions.office_ids = data_maps.office_ids.reduce((accumulator, currentOffice) => {
                    if(currentOffice.officeName.toLowerCase().includes(event.query.toLowerCase())) {
                        accumulator.push(currentOffice);
                    }

                    return accumulator;
                }, []);
            }
        }, 250);
    };
    const onItemSelectOfficeID = (event) => {
        const selected_office = data_maps.office_map.reduce((accumulator, currentOffice) => {
            if(currentOffice.officeID === event.value.id) {
                accumulator = currentOffice;
            }

            return accumulator;
        }, null);

        if(selected_office.officeType === 'section') {
            forms.selected_employee.serviceID = selected_office.serviceID;
            forms.selected_employee.sectionID = event.value.id;
            forms.selected_employee.unitID = null;
        } else {
            forms.selected_employee.serviceID = selected_office.serviceID;
            forms.selected_employee.sectionID = selected_office.sectionID;
            forms.selected_employee.unitID = event.value.id;
        }
    };

    // ! ----------------------------------------------------------------------------------------------------

    const toolbar_menu_ref_settings = ref();
    const toolbar_menu_model = {
        settings: [
            { label: 'New Employee', icon: 'pi pi-plus', command: () => clearAll() },
            { label: 'Print', icon: 'pi pi-print' },
            { separator: true },
            { label: 'Refresh', icon: 'pi pi-refresh', command: () => refreshEmployees() }
        ]
    };
    const toggleSettings = (event) => {
        toolbar_menu_ref_settings.value.toggle(event);
    };

    const clearAll = () => {
        initFilters();
        onRowUnselectEmployee();
    };

    // ! ----------------------------------------------------------------------------------------------------

    const pendings = reactive({
        insert_employee: false,
        delete_employee: false
    });

    import { useConfirm } from "primevue/useconfirm";
    const confirm = useConfirm();
    import { useToast } from 'primevue/usetoast';
    const toast = useToast();

    const contextmenu_selected_employee = ref();
    const contextmenu_ref_employee = ref();
    const contextmenu_model = {
        employee: [
            { label: 'View', icon: 'pi pi-search', command: () => viewSelectedEmployee(contextmenu_selected_employee) },
            { label: 'Delete', icon: 'pi pi-times', command: () => confirmDeleteSelectedEmployee(contextmenu_selected_employee) }
        ]
    };
    const onRowContextMenuEmployee = (event) => {
        contextmenu_ref_employee.value.show(event.originalEvent);
    };

    const viewSelectedEmployee = (selected_employee) => {
        forms.selected_employee.id = selected_employee.value.id;

        forms.selected_employee.lastName = selected_employee.value.lastName;
        forms.selected_employee.firstName = selected_employee.value.firstName;
        forms.selected_employee.middleName = selected_employee.value.middleName;
        forms.selected_employee.genealogySuffix = selected_employee.value.genealogySuffix;
        forms.selected_employee.appointmentID = selected_employee.value.appointmentID;
        forms.selected_employee.employeeID = selected_employee.value.employeeID;
        forms.selected_employee.biometricsNo = selected_employee.value.biometricsNo;
        forms.selected_employee.serviceID = selected_employee.value.serviceID;
        forms.selected_employee.sectionID = selected_employee.value.sectionID;
        forms.selected_employee.unitID = selected_employee.value.unitID;

        forms_autocomplete.selected_employee.office_id = data_maps.office_ids.reduce((accumulator, currentOffice) => {
            if(currentOffice.id === (selected_employee.value.unitID ?? selected_employee.value.sectionID)) {
                accumulator = currentOffice;
            }

            return accumulator;
        }, null);
    };

    const confirmDeleteSelectedEmployee = (employee) => {
        const employee_id = employee.value.id;
        const employee_lastName = employee.value.lastName;
        const employee_firstName = employee.value.firstName;

        confirm.require({
            group: 'templating',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-circle',
            message: 'Proceed delete '+employee_firstName+' '+employee_lastName+'?',
            accept: () => {
                toast.add({
                    severity: 'info',
                    summary: 'Processing',
                    detail: 'Deleting employee..',
                    life: 20000
                });

                deleteSelectedEmployee(employee_id);
            },
            reject: () => {
                toast.add({
                    severity: 'info',
                    summary: 'Cancelled',
                    detail: 'Deleting of employee cancelled',
                    life: 3000
                });
            }
        });
    };
    const deleteSelectedEmployee = async (employee_id) => {
        const { data: delete_employee_data, error: delete_employee_error } = await useFetch('/api/employees', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            },
            body: {
                user_id: user.value.id,
                selected_employee: {
                    id: employee_id
                }
            },

            async onRequest() {
                pendings.delete_employee = true;
            },
            async onResponse() {
                setTimeout(() => {
                    pendings.delete_employee = false;
                }, 2000);
            }
        });

        if(delete_employee_error.value) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: delete_employee_error.value.statusMessage,
                life: 5000
            });
        } else {
            toast.removeAllGroups();

            const deleted_employee = delete_employee_data.value.data.employee;

            employees.value = [...employees.value.reduce((accumulator, currentEmployee) => {
                    if(currentEmployee.id != deleted_employee.id) {
                        accumulator.push(currentEmployee);
                    }

                    return accumulator;
                }, [])
            ];

            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Employee deleted',
                life: 2000
            });
        }
    };

    // ! ----------------------------------------------------------------------------------------------------

    const processEmployee = () => {
        if(!forms.selected_employee.lastName || !forms.selected_employee.firstName
            || !forms.selected_employee.appointmentID || !forms.selected_employee.employeeID || !forms.selected_employee.biometricsNo
            || !forms.selected_employee.serviceID || !forms.selected_employee.sectionID) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'to Register, fill in required (*) fields, to Update, select employee',
                life: 5000 
            });

            return false;
        }

        toast.add({
            severity: 'info',
            summary: 'Processing',
            detail: 'Processing employee..',
            life: 20000
        });

        upsertEmployee();
    };
    const upsertEmployee = async () => {
        const { data: upsert_employee_data, error: upsert_employee_error } = await useFetch('/api/employees', {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: {
                user_id: user.value.id,
                selected_employee: {
                    id: forms.selected_employee.id,

                    lastName: toTitleCase(forms.selected_employee.lastName),
                    firstName: toTitleCase(forms.selected_employee.firstName),
                    middleName: forms.selected_employee.middleName ? toTitleCase(forms.selected_employee.middleName) : null,
                    genealogySuffix: forms.selected_employee.genealogySuffix,
                    appointmentID: forms.selected_employee.appointmentID,
                    employeeID: forms.selected_employee.employeeID,
                    biometricsNo: forms.selected_employee.biometricsNo,
                    serviceID: forms.selected_employee.serviceID,
                    sectionID: forms.selected_employee.sectionID,
                    unitID: forms.selected_employee.unitID
                }
            },

            async onRequest() {
                pendings.insert_employee = true;
            },
            async onResponse() {
                setTimeout(() => {
                    pendings.insert_employee = false;
                }, 2000);
            }
        });

        if(upsert_employee_error.value) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: upsert_employee_error.value.statusMessage,
                life: 5000
            });
        } else {
            toast.removeAllGroups();

            const upsert_employee = upsert_employee_data.value.data.employee;
            let toast_detail = null;

            if(upsert_employee_data.value.status == 'updated') {
                employees.value = [...employees.value.reduce((accumulator, currentEmployee) => {
                    if(currentEmployee.id != upsert_employee.id) {
                        accumulator.push(currentEmployee);
                    }

                    return accumulator;
                }, []), upsert_employee];

                toast_detail = 'Employee updated.';
            } else {
                employees.value = [...employees.value, upsert_employee];

                toast_detail = 'Employee registered.';
            }

            employees.value.sort((prev, next) => {
                return prev.lastName > next.lastName
                    ? 1
                    : ((prev.lastName < next.lastName)
                        ? -1
                        : ((prev.firstName > next.firstName)
                            ? 1
                            : ((prev.firstName < next.firstName)
                                ? -1
                                : 0)))
            });

            onRowUnselectEmployee();

            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: toast_detail,
                life: 2000
            });
        }
    };

    // ! ----------------------------------------------------------------------------------------------------

    onMounted(async () => {
        watchEffect(async () => {
            if(!user.value) {
                await navigateTo('/');
            }
        });

        // ! ----------------------------------------------------------------------------------------------------
    });
</script>
<template>
    <div class="grid grid-cols-12 gap-4 p-4">
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
                        <Button @click="acceptCallback" label="Delete" severity="warning" class="w-full"></Button>
                    </div>
                </div>
            </template>
        </ConfirmDialog>

        <div class="col-span-12 md:col-span-9 order-last md:order-first">
            <Panel toggleable style="background-color: var(--surface-50);">
                <template #header>
                    <div class="flex items-center gap-2">
                        <Avatar icon="pi pi-users" size="large" style="background-color: var(--surface-0); color: var(--primary-500);" />
                        <span class="p-text-secondary">Employee Management</span>
                    </div>
                </template>
                <div class="flex flex-col gap-2">
                    <Toolbar class="flex flex-nowrap">
                        <template #start>
                            <Button icon="pi pi-bars" class="mr-2" severity="secondary" />
                            <Button @click="clearAll()" icon="pi pi-plus" class="mr-2" severity="secondary" v-tooltip.hover.top="'New Employee'" />
                            <Button icon="pi pi-print" severity="secondary" v-tooltip.hover.top="'Print'" />
                        </template>
                        <template #center>
                            <InputGroup iconPosition="left">
                                <InputGroupAddon>
                                    <i class="pi pi-search" style="color: orange"></i>
                                </InputGroupAddon>
                                <InputText v-model="filters['global'].value" placeholder="Search" />
                                <Button @click="clearAll()" label="Clear" />
                            </InputGroup>
                        </template>
                        <template #end>
                            <Button @click="toggleSettings($event)" icon="pi pi-cog" severity="secondary" class="p-panel-header-icon p-link mr-2" />
                            <Menu ref="toolbar_menu_ref_settings" :model="toolbar_menu_model.settings" :popup="true" />
                        </template>
                    </Toolbar>
                    <ContextMenu ref="contextmenu_ref_employee" :model="contextmenu_model.employee" @hide="contextmenu_selected_employee = null" />

                    <div v-if="pending" class="flex flex-col gap-2">
                        <Skeleton height="5.2rem" width="100%" />
                        <div class="flex flex-row gap-2">
                            <Skeleton height="6.2rem" width="6.2rem" />
                            <div class="w-full flex flex-col gap-2">
                                <Skeleton height="1.75rem" width="30%" />
                                <Skeleton height="1.75rem" width="18%" />
                                <Skeleton height="1.75rem" width="35%" />
                            </div>
                        </div>
                        <div class="flex flex-row gap-2">
                            <Skeleton height="6.2rem" width="6.2rem" />
                            <div class="w-full flex flex-col gap-2">
                                <Skeleton height="1.75rem" width="45%" />
                                <Skeleton height="1.75rem" width="62%" />
                                <Skeleton height="1.75rem" width="55%" />
                            </div>
                        </div>
                        <div class="flex flex-row gap-2">
                            <Skeleton height="6.2rem" width="6.2rem" />
                            <div class="w-full flex flex-col gap-2">
                                <Skeleton height="1.75rem" width="90%" />
                                <Skeleton height="1.75rem" width="100%" />
                                <Skeleton height="1.75rem" width="75%" />
                            </div>
                        </div>
                        <div class="flex flex-row gap-2">
                            <Skeleton height="6.2rem" width="6.2rem" />
                            <div class="w-full flex flex-col gap-2">
                                <Skeleton height="1.75rem" width="79%" />
                                <Skeleton height="1.75rem" width="67%" />
                                <Skeleton height="1.75rem" width="35%" />
                            </div>
                        </div>
                        <div class="flex flex-row gap-2">
                            <Skeleton height="6.2rem" width="6.2rem" />
                            <div class="w-full flex flex-col gap-2">
                                <Skeleton height="1.75rem" width="45%" />
                                <Skeleton height="1.75rem" width="35%" />
                                <Skeleton height="1.75rem" width="55%" />
                            </div>
                        </div>
                        <div class="flex flex-row gap-2">
                            <Skeleton height="6.2rem" width="6.2rem" />
                            <div class="w-full flex flex-col gap-2">
                                <Skeleton height="1.75rem" width="84%" />
                                <Skeleton height="1.75rem" width="97%" />
                                <Skeleton height="1.75rem" width="75%" />
                            </div>
                        </div>
                    </div>
                    <div v-else>
                        <DataTable :value="employees" dataKey="id"
                            contextMenu v-model:contextMenuSelection="contextmenu_selected_employee" @rowContextmenu="onRowContextMenuEmployee($event)"
                            v-model:filters="filters" filterDisplay="row" :globalFilterFields="['lastName', 'firstName', 'middleName', 'employeeID', 'biometricsNo']"
                            selectionMode="single" @rowSelect="onRowSelectEmployee($event)" @rowUnselect="onRowUnselectEmployee()"
                            paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]"
                            size="small"
                            showGridlines stripedRows
                            tableClass="text-sm text-balance">
                            <Column header="Profile" headerStyle="background-color: var(--primary-50);" filterHeaderStyle="background-color: var(--primary-50);" bodyClass="p-0">
                                <template #body="slotProps">
                                    <div class="w-full flex justify-center items-center">
                                        <NuxtImg provider="cloudinary"
                                            :placeholder="image_placeholders.table_profile"
                                            :src="'/avatar/employees/'+slotProps.data.biometricsNo+'.jpg'"
                                            height="80"
                                            fit="cover" />
                                    </div>
                                </template>
                            </Column>
                            <Column field="['lastName', 'firstName', 'middleName']" header="Name" headerStyle="background-color: var(--primary-50);" filterHeaderStyle="background-color: var(--primary-50);">
                                <template #body="slotProps">
                                    <p>{{ slotProps.data.lastName }}, {{ slotProps.data.firstName }} {{ slotProps.data.middleName }} {{ slotProps.data.genealogySuffix }}</p>
                                </template>
                            </Column>
                            <Column field="appointmentID" header="Appointment Status" :showFilterMenu="false" :showClearButton="false" headerStyle="background-color: var(--primary-50);" filterHeaderStyle="background-color: var(--primary-50);">
                                <template #body="slotProps">
                                    <p v-if="slotProps.data.appointmentID == 'permanent'">Permanent</p>
                                    <p v-else-if="slotProps.data.appointmentID == 'casual_with_appointment'">Casual with Appointment</p>
                                    <p v-else-if="slotProps.data.appointmentID == 'contract_of_service'">Contract of Service</p>
                                    <p v-else-if="slotProps.data.appointmentID == 'job_order'">Job Order</p>
                                    <p v-else-if="slotProps.data.appointmentID == 'temporary'">Temporary</p>
                                    <p v-else>{{ slotProps.data.appointmentID }}</p>
                                </template>
                                <template #filter="{ filterModel, filterCallback }">
                                    <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="table_dropdown_options.employment_status" optionValue="id" optionLabel="name" placeholder="Filter" :showClear="true" />
                                </template>
                            </Column>
                            <Column field="employeeID" header="Employee ID" headerStyle="background-color: var(--primary-50);" filterHeaderStyle="background-color: var(--primary-50);">
                                <template #body="slotProps">
                                    <p>{{ slotProps.data.employeeID }}</p>
                                </template>
                            </Column>
                            <Column field="biometricsNo" header="Biometrics No." headerStyle="background-color: var(--primary-50);" filterHeaderStyle="background-color: var(--primary-50);">
                                <template #body="slotProps">
                                    <p>{{ slotProps.data.biometricsNo }}</p>
                                </template>
                            </Column>
                            <Column field="service.serviceName" header="Service" :showFilterMenu="false" :showClearButton="false" headerStyle="background-color: var(--primary-50);" filterHeaderStyle="background-color: var(--primary-50);">
                                <template #body="slotProps">
                                    <p>{{ slotProps.data.service?.serviceName }}</p>
                                </template>
                                <template #filter="{ filterModel, filterCallback }">
                                    <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="table_dropdown_options.service_names" placeholder="Filter" :showClear="true" />
                                </template>
                            </Column>
                            <Column field="section.sectionName" header="Section" :showFilterMenu="false" :showClearButton="false" headerStyle="background-color: var(--primary-50);" filterHeaderStyle="background-color: var(--primary-50);">
                                <template #body="slotProps">
                                    <p>{{ slotProps.data.section?.sectionName }}</p>
                                </template>
                                <template #filter="{ filterModel, filterCallback }">
                                    <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="table_dropdown_options.section_names" placeholder="Filter" :showClear="true" />
                                </template>
                            </Column>
                            <Column field="unit.unitName" header="Unit" :showFilterMenu="false" :showClearButton="false" headerStyle="background-color: var(--primary-50);" filterHeaderStyle="background-color: var(--primary-50);">
                                <template #body="slotProps">
                                    <p>{{ slotProps.data.unit?.unitName }}</p>
                                </template>
                                <template #filter="{ filterModel, filterCallback }">
                                    <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="table_dropdown_options.unit_names" placeholder="Filter" :showClear="true" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>
                <template #footer>
                    <div class="flex items-center justify-between gap-2">
                        <Button icon="pi pi-bookmark" severity="secondary" rounded text />
                        <div class="flex items-center gap-2">
                            <i class="pi pi-info-circle" style="background-color: var(--surface-0); color: var(--primary-500);" />
                            <span class="p-text-secondary text-wrap">Integrated Management Information Systems Section</span>
                        </div>
                    </div>
                </template>
            </Panel>
        </div>

        <div class="col-span-12 md:col-span-3 order-first md:order-last">
            <Card style="overflow: hidden;" class="border-2">
                <template #header>
                    <NuxtImg v-if="forms.selected_employee.biometricsNo" provider="cloudinary"
                        :src="'/avatar/employees/'+forms.selected_employee.biometricsNo+'.jpg'"
                        height="450"
                        width="450"
                        fit="cover" />
                    <NuxtImg v-else provider="cloudinary"
                        :src="'/avatar/no-picture/employee/gcgmmc.jpg'"
                        height="450"
                        width="450"
                        fit="cover" />
                </template>
                <template #content>
                    <div class="flex flex-col gap-1 text-sm">
                        <label for="lastName">Last Name<span class="inline-block align-top text-red-500">*</span></label>
                        <Skeleton v-if="pendings.insert_employee" id="lastName" height="2.4rem" />
                        <InputText v-else id="lastName" v-model="forms.selected_employee.lastName" />

                        <label for="firstName">First Name<span class="inline-block align-top text-red-500">*</span></label>
                        <Skeleton v-if="pendings.insert_employee" id="firstName" height="2.4rem" />
                        <InputText v-else id="firstName" v-model="forms.selected_employee.firstName" />

                        <label for="middleName">Middle Name</label>
                        <Skeleton v-if="pendings.insert_employee" id="middleName" height="2.4rem" />
                        <InputText v-else id="middleName" v-model="forms.selected_employee.middleName" />

                        <label for="genealogySuffix">Genealogy Suffix</label>
                        <Dropdown id="genealogySuffix" v-model="forms.selected_employee.genealogySuffix" :options="form_dropdown_options.genealogy_suffix" :loading="pendings.insert_employee" showClear />

                        <label for="appointmentID">Appointment Status<span class="inline-block align-top text-red-500">*</span></label>
                        <Dropdown id="appointmentID" v-model="forms.selected_employee.appointmentID" :options="form_dropdown_options.employment_status" optionValue="id" optionLabel="name" :loading="pendings.insert_employee" />

                        <label for="employeeID">Employee ID<span class="inline-block align-top text-red-500">*</span></label>
                        <Skeleton v-if="pendings.insert_employee" id="employeeID" height="2.4rem" />
                        <InputText v-else id="employeeID" v-model="forms.selected_employee.employeeID" />

                        <label for="biometricsNo">Biometrics No.<span class="inline-block align-top text-red-500">*</span></label>
                        <Skeleton v-if="pendings.insert_employee" id="biometricsNo" height="2.4rem" />
                        <InputText v-else id="biometricsNo" v-model="forms.selected_employee.biometricsNo" />

                        <Divider align="center" class="my-1">
                            <span class="text-sm">Office</span>
                        </Divider>

                        <AutoComplete v-model="forms_autocomplete.selected_employee.office_id" :suggestions="form_autocomplete_suggestions.office_ids"
                            dataKey="id" optionLabel="officeName" placeholder="Search"
                            @complete="onCompleteOfficeID($event)" @item-select="onItemSelectOfficeID($event)"
                            forceSelection dropdown dropdownMode="current"
                            :loading="pendings.insert_employee" />

                        <label for="serviceID">Service<span class="inline-block align-top text-red-500">*</span></label>
                        <Dropdown id="serviceID" v-model="forms.selected_employee.serviceID" disabled :options="form_dropdown_options.service_ids" optionValue="id" optionLabel="serviceName" :loading="pendings.insert_employee" />

                        <label for="sectionID">Section<span class="inline-block align-top text-red-500">*</span></label>
                        <Dropdown id="sectionID" v-model="forms.selected_employee.sectionID" disabled :options="form_dropdown_options.section_ids" optionValue="id" optionLabel="sectionName" :loading="pendings.insert_employee" />

                        <label for="unitID">Unit</label>
                        <Dropdown id="unitID" v-model="forms.selected_employee.unitID" disabled :options="form_dropdown_options.unit_ids" optionValue="id" optionLabel="unitName" :loading="pendings.insert_employee" />
                    </div>
                </template>
                <template #footer>
                    <div class="flex gap-3 mt-0">
                        <Button @click="clearAll()" label="Clear" severity="secondary" outlined class="w-full" />
                        <Button @click="processEmployee()" :loading="pendings.insert_employee" :label="forms.selected_employee.id ? 'Update' : 'Save'" class="w-full" />
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>