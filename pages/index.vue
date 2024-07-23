<script setup>
    const user = ref(null);

    // ! ----------------------------------------------------------------------------------------------------

    const timeline_events = ref([
        {
            title: 'Employee Management',
            subtitle: 'Started: 12/26/2023',
            icon: 'pi pi-cog pi-spin',
            color: 'bg-gradient-to-r from-blue-500 to-cyan-400',
            image: '/images/timeline/employee-management/19191234.jpg',
            description: 'User Registration, User Login, Department Designation, User Authorization, Reset Password etc.',
            status: 'On-going..'
        },
        {
            title: 'Daily Time Record',
            subtitle: 'Started: 02/12/2024',
            icon: 'pi pi-cog pi-spin',
            color: 'bg-gradient-to-r from-red-500 to-amber-400',
            image: '/images/timeline/daily-time-record/19190104.jpg',
            description: 'Biometrics Ins & Outs, Generate Daily Time Record (Undertime, Schedules, Absenteeism Rate, Leaves OBs OTs), Official Extracurricular Duties Application (OBs, OTs), etc.',
            status: 'On-going..'
        },
        {
            title: 'Time Management',
            subtitle: '03/01/2024',
            icon: 'pi pi-calendar-plus',
            color: 'bg-gradient-to-r from-lime-500 to-green-300',
            image: '/images/timeline/time-management/19184323.jpg',
            description: 'Schedule Plotting, Time Adjustments, OBs OTs (Official Extracurricular Duty) Management, etc.',
            status: 'On roadmap..'
        },
        {
            title: 'Leave Application',
            subtitle: '05/01/2024',
            icon: 'pi pi-calendar-plus',
            color: 'bg-gradient-to-r from-amber-500 to-yellow-300',
            image: '/images/timeline/leave-application/17182803.jpg',
            description: 'Online Filling, Application Status, Leave Credits.',
            status: 'On roadmap..'
        },
        {
            title: 'Leave Management',
            subtitle: '05/01/2024',
            icon: 'pi pi-calendar-plus',
            color: 'bg-gradient-to-r from-cyan-500 to-indigo-300',
            image: '/images/timeline/leave-management/18181211.jpg',
            description: 'Leave Approval, Adjustments, Allowable Date Settings.',
            status: 'On roadmap..'
        },
        {
            title: 'Employee Profiling',
            icon: 'pi pi-calendar-plus',
            color: 'bg-gradient-to-r from-violet-500 to-fuchsia-400',
            image: '/images/timeline/employee-profiling/19180805.jpg',
            description: 'Update Basic Information, Add Trainings and Experiences, Generate Personnal Data Sheet etc.',
            status: 'On-roadmap..'
        },
        {
            title: 'Payroll Management',
            icon: 'pi pi-calendar-plus',
            color: 'bg-gradient-to-r from-fuchsia-500 to-rose-400',
            image: '/images/timeline/payroll-management/19172107.jpg',
            description: 'Generate Payroll, Payslip etc.',
            status: 'On roadmap..'
        },
        {
            title: 'Generative Reports',
            icon: 'pi pi-calendar-plus',
            color: 'bg-gradient-to-r from-sky-500 to-emerald-400',
            image: '/images/timeline/generative-reports/17182010.jpg',
            description: 'Personal Data Sheet etc.',
            status: 'On roadmap..'
        }
    ]);

    const org_chart_service = ref({
        key: '0',
        type: 'person',
        styleClass: 'bg-red-200 w-40',
        data: {
            image: '/images/organizational-chart/538.jpg',
            name: 'Mutya Kismet T. Macuno, MD, FPPS FPSNbM, MDM',
            title: 'Medical Center Chief'
        },
        children: [
            {
                key: '0_0',
                type: 'person',
                styleClass: 'bg-green-100 w-36',
                data: {
                    image: '/images/organizational-chart/10.jpg',
                    name: 'Valeria M. Sulatra, MD, MPH, CSEE',
                    title: 'Chief, Medical Profession Staff'
                }
            },
            {
                key: '0_1',
                type: 'person',
                styleClass: 'bg-yellow-100 w-36',
                data: {
                    image: '/images/organizational-chart/1653.jpg',
                    name: 'Robin S. Buenbrazo, RN, MN, CHA, CLDP',
                    title: 'Chief Nurse, Nursing Service'
                }
            },
            {
                key: '0_2',
                type: 'person',
                styleClass: 'bg-blue-200 w-36',
                data: {
                    image: '/images/organizational-chart/3168.jpg',
                    name: 'David Ammiel R. Tirol V, MD, DPBO',
                    title: 'Head, Allied Health Professional Service'
                }
            },
            {
                key: '0_3',
                type: 'person',
                styleClass: 'bg-orange-100 w-36',
                data: {
                    image: '/images/organizational-chart/35.jpg',
                    name: 'Cyd Charris C. Castillo, CPA, MPA',
                    title: 'Chief Administrator Officer, Finance Service'
                }
            },
            {
                key: '0_4',
                type: 'person',
                styleClass: 'bg-teal-100 w-36',
                data: {
                    image: '/images/organizational-chart/1454.jpg',
                    name: 'Mary Grace M. Gallito, JD, MPA',
                    title: 'Chief Administrator Officer, Hospital Operations and Patient Support Service'
                }
            }
        ]
    });
    const org_chart_mcco = ref({
        key: '0',
        label: 'Medical Center Chief Office',
        styleClass: 'bg-red-200',
        children: [
            {
                key: '0_0',
                label: 'Infection Prevention and Control Unit',
                styleClass: 'bg-red-200',
                children: [
                    {
                        label: 'Hospital Epidemiology Surveillance Unit',
                        styleClass: 'bg-red-100'
                    }
                ]
            },
            {
                key: '0_1',
                label: 'Planning and Development / Health Facility Development Unit',
                styleClass: 'bg-red-200'
            },
            {
                key: '0_2',
                label: 'Professional Education Training and Research Unit',
                styleClass: 'bg-red-200'
            },
            {
                key: '0_3',
                label: 'Public Health Unit',
                styleClass: 'bg-red-200'
            },
            {
                key: '0_4',
                label: 'Quality Management System Office',
                styleClass: 'bg-red-200'
            }
        ]
    });
    const org_chart_medical = ref({
        key: '0',
        label: 'Office of the Chief Medical Professional Staff',
        styleClass: 'bg-green-100',
        children: [
            {
                key: '0_0',
                label: 'Dental Section',
                styleClass: 'bg-green-100'
            },
            {
                key: '0_1',
                label: 'Department of Anesthesiology',
                styleClass: 'bg-green-100'
            },
            {
                key: '0_2',
                label: 'Department of Emergency Medicine',
                styleClass: 'bg-green-100'
            },
            {
                key: '0_3',
                label: 'Department of Family and Community Medicine',
                styleClass: 'bg-green-100'
            },
            {
                key: '0_4',
                label: 'Department of Internal Medicine',
                styleClass: 'bg-green-100',
                children: [
                    {
                        label: 'Oncology Services Chemotheraphy and Hematology Unit',
                        styleClass: 'bg-green-50'
                    }
                ]
            },
            {
                key: '0_5',
                label: 'Department of Obstetrics and Gynecology',
                styleClass: 'bg-green-100'
            },
            {
                key: '0_6',
                label: 'Department of Ocular Health',
                styleClass: 'bg-green-100'
            },
            {
                key: '0_7',
                label: 'Department of Orthopedics',
                styleClass: 'bg-green-100'
            },
            {
                key: '0_8',
                label: 'Department of Pathology',
                styleClass: 'bg-green-100',
                children: [
                    {
                        label: 'Blood Bank',
                        styleClass: 'bg-green-50'
                    },
                    {
                        label: 'Laboratory',
                        styleClass: 'bg-green-50'
                    },
                    {
                        label: 'Molecular Unit',
                        styleClass: 'bg-green-50'
                    }
                ]
            },
            {
                key: '0_9',
                label: 'Department of Pediatrics',
                styleClass: 'bg-green-100',
            },
            {
                key: '0_10',
                label: 'Department of Radiology',
                styleClass: 'bg-green-100',
            },
            {
                key: '0_11',
                label: 'Department of Rehabilitation Medicine',
                styleClass: 'bg-green-100',
            },
            {
                key: '0_12',
                label: 'Department of Surgery',
                styleClass: 'bg-green-100',
            },
            {
                key: '0_13',
                label: 'Outpatient Department',
                styleClass: 'bg-green-100',
            },
            {
                key: '0_14',
                label: 'Respiratory Unit',
                styleClass: 'bg-green-100',
            }
        ]
    });
    const org_chart_nursing = ref({
        key: '0',
        label: 'Nursing Service Office',
        styleClass: 'bg-yellow-100',
        children: [
            {
                key: '0_0',
                label: 'Central Supply and Sterilization',
                styleClass: 'bg-yellow-100'
            },
            {
                key: '0_1',
                label: 'Clinical Nursing Units',
                styleClass: 'bg-yellow-100',
                children: [
                    {
                        label: 'Emerging and Re-emerging Infectious Disease',
                        styleClass: 'bg-yellow-50'
                    },
                    {
                        label: 'Family Medicine',
                        styleClass: 'bg-yellow-50'
                    },
                    {
                        label: 'Medical 1',
                        styleClass: 'bg-yellow-50'
                    },
                    {
                        label: 'Medical 2',
                        styleClass: 'bg-yellow-50'
                    },
                    {
                        label: 'Medical 3',
                        styleClass: 'bg-yellow-50'
                    },
                    {
                        label: 'Obstetrics - Gynecology',
                        styleClass: 'bg-yellow-50'
                    },
                    {
                        label: 'Orthopedics / Trauma',
                        styleClass: 'bg-yellow-50'
                    },
                    {
                        label: 'Pediatrics Ward',
                        styleClass: 'bg-yellow-50'
                    },
                    {
                        label: 'Surgery',
                        styleClass: 'bg-yellow-50'
                    }
                ]
            },
            {
                key: '0_2',
                label: 'Delivery Room',
                styleClass: 'bg-yellow-100'
            },
            {
                key: '0_3',
                label: 'Emergency Room',
                styleClass: 'bg-yellow-100'
            },
            {
                key: '0_4',
                label: 'Hemodialysis Unit',
                styleClass: 'bg-yellow-100'
            },
            {
                key: '0_5',
                label: 'Labor Room',
                styleClass: 'bg-yellow-100'
            },
            {
                key: '0_6',
                label: 'Ligation Room',
                styleClass: 'bg-yellow-100'
            },
            {
                key: '0_7',
                label: 'Obstetrics Complex',
                styleClass: 'bg-yellow-100'
            },
            {
                key: '0_8',
                label: 'Obstetrics Operating Room / Caesarean Section Operating Room',
                styleClass: 'bg-yellow-100'
            },
            {
                key: '0_9',
                label: 'Operating Room',
                styleClass: 'bg-yellow-100'
            },
            {
                key: '0_10',
                label: 'Outpatient Department',
                styleClass: 'bg-yellow-100'
            },
            {
                key: '0_11',
                label: 'Recovery Room - Post Anesthesia Care Unit',
                styleClass: 'bg-yellow-100'
            },
            {
                key: '0_12',
                label: 'Special Care Areas',
                styleClass: 'bg-yellow-100',
                children: [
                    {
                        label: 'Acute Stroke Unit',
                        styleClass: 'bg-yellow-50'
                    },
                    {
                        label: 'Intensive Maternal Unit',
                        styleClass: 'bg-yellow-50'
                    },
                    {
                        label: 'Medical Intensive Care Unit 1',
                        styleClass: 'bg-yellow-50'
                    },
                    {
                        label: 'Medical Intensive Care Unit 2',
                        styleClass: 'bg-yellow-50'
                    },
                    {
                        label: 'Medical Intensive Care Unit 3',
                        styleClass: 'bg-yellow-50'
                    },
                    {
                        label: 'Medical Intensive Care Unit 4',
                        styleClass: 'bg-yellow-50'
                    },
                    {
                        label: 'Neonatal Intensive Care Unit',
                        styleClass: 'bg-yellow-50'
                    },
                    {
                        label: 'Obstetrics - Emergency Room',
                        styleClass: 'bg-yellow-50'
                    },
                    {
                        label: 'Operating Room - Post Anesthesia Care Unit',
                        styleClass: 'bg-yellow-50'
                    },
                    {
                        label: 'Pediatric Intensive Care Unit',
                        styleClass: 'bg-yellow-50'
                    },
                    {
                        label: 'Surgical Intensive Care Unit',
                        styleClass: 'bg-yellow-50'
                    }
                ]
            },
        ]
    });
    const org_chart_allied = ref({
        key: '0',
        label: 'Allied Health Professional Services Office',
        styleClass: 'bg-blue-200',
        children: [
            {
                key: '0_0',
                label: 'Health Information Management Section',
                styleClass: 'bg-blue-200',
                children: [
                    {
                        label: 'Admitting and Information Unit',
                        styleClass: 'bg-blue-100'
                    }
                ]
            },
            {
                key: '0_1',
                label: 'Medical Social Service Section',
                styleClass: 'bg-blue-200'
            },
            {
                key: '0_2',
                label: 'Nutrition and Dietetics Section',
                styleClass: 'bg-blue-200'
            },
            {
                key: '0_3',
                label: 'Pharmacy Section',
                styleClass: 'bg-blue-200'
            }
        ]
    });
    const org_chart_finance = ref({
        key: '0',
        label: 'Finance - Office of the Chief Administrative Officer',
        styleClass: 'bg-orange-100',
        children: [
            {
                key: '0_0',
                label: 'Accounting',
                styleClass: 'bg-orange-100'
            },
            {
                key: '0_1',
                label: 'Billing and Claims',
                styleClass: 'bg-orange-100',
                children: [
                    {
                        label: 'Billing Unit',
                        styleClass: 'bg-red-50'
                    },
                    {
                        label: 'Claims Unit',
                        styleClass: 'bg-red-50'
                    }
                ]
            },
            {
                key: '0_2',
                label: 'Budget',
                styleClass: 'bg-orange-100'
            },
            {
                key: '0_3',
                label: 'Cash Operations',
                styleClass: 'bg-orange-100'
            }
        ]
    });
    const org_chart_hopss = ref({
        key: '0',
        label: 'Office of the Chief Administrative Officer',
        styleClass: 'bg-teal-100',
        children: [
            {
                key: '0_0',
                label: 'Engineering and Facilities Management Section',
                styleClass: 'bg-teal-100',
                children: [
                    {
                        label: 'General Service Office',
                        styleClass: 'bg-teal-50'
                    }
                ]
            },
            {
                key: '0_1',
                label: 'Human Resource Management Section',
                styleClass: 'bg-teal-100'
            },
            {
                key: '0_2',
                label: 'Integrated Management Information Systems Section',
                styleClass: 'bg-teal-100'
            },
            {
                key: '0_3',
                label: 'Materials Management Section',
                styleClass: 'bg-teal-100'
            },
            {
                key: '0_4',
                label: 'Procurement Section',
                styleClass: 'bg-teal-100'
            },
            {
                key: '0_5',
                label: 'Security Section',
                styleClass: 'bg-teal-100'
            },
        ]
    });
    const tab_active = ref(0);

    // ! ----------------------------------------------------------------------------------------------------

    onMounted(() => {
        const supabaseUser = useSupabaseUser();

        watchEffect(async () => {
            if(supabaseUser.value) {
                user.value = supabaseUser.value;
            }
        });
    });
</script>
<template>
    <div class="container">
        <div class="grid grid-cols-12">
            <div class="col-span-12 md:col-span-6
                flex justify-center items-center
                w-full p-4">
                <NuxtImg provider="cloudinary"
                    src="/images/home/2467939.png"
                    width="500"
                    height="500"
                    fit="fill" />
            </div>

            <div class="col-span-12 md:col-span-6
                flex flex-col justify-center
                w-full min-h-96 md:min-h-screen p-4">
                <h1 class="my-4 text-4xl md:text-5xl text-white opacity-75 font-bold leading-tight text-center md:text-left">
                    <span class="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-pink-500 to-purple-500">
                        PYLON
                    </span>
                    <span class="text-teal-400">|</span>
                    <NuxtLink to="/test">
                        <span class="text-yellow-400 tracking-wide">
                        Human Capital Management
                        </span>
                    </NuxtLink>
                </h1>
                <p class="text-xl md:text-2xl text-center md:text-left text-teal-600 mb-8 font-medium tracking-wide">
                    Gov. Celestino Gallares Memorial Medical Center
                </p>

                <div v-if="!user"
                    class="flex justify-center md:justify-start gap-4">
                    <NuxtLink to="/login">
                        <Button type="button" label="Login" icon="pi pi-sign-in" raised
                            class="py-3 md:py-6 px-10 md:px-16 text-base md:text-lg"
                            icon-class="text-lg md:text-xl" />
                    </NuxtLink>
                    <NuxtLink to="/register">
                        <Button type="button" label="Register" icon="pi pi-user-plus" text raised
                            class="py-3 md:py-6 px-6 md:px-12 text-base md:text-xl"
                            icon-class="text-lg md:text-xl" />
                    </NuxtLink>
                </div>
                <div v-else
                    class="flex justify-center md:justify-start gap-4">
                    <NuxtLink to="/panel/user">
                        <Button type="button" label="User Panel" icon="pi pi-id-card" text raised
                            class="py-3 md:py-6 px-10 md:px-16 text-base md:text-xl"
                            icon-class="text-lg md:text-xl" />
                    </NuxtLink>
                    <NuxtLink to="/panel/administrator">
                        <Button type="button" label="Administrator Panel" icon="pi pi-chart-bar" text raised
                            class="py-3 md:py-6 px-6 md:px-12 text-base md:text-xl"
                            icon-class="text-lg md:text-xl" />
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>

    <div class="container flex items-center justify-center" style="background-color: var(--primary-50); color: var(--primary-500);">
        <div class="w-full md:w-1/2 min-h-screen p-5">
            <Timeline :value="timeline_events" align="alternate" class="customized-timeline">
                <template #marker="slotProps">
                    <div class="flex items-center justify-center
                        text-white rounded-full z-1 shadow-1 p-3" :class="slotProps.item.color">
                        <i :class="slotProps.item.icon" style="font-size: 1.5rem"></i>
                    </div>
                </template>
                <template #content="slotProps" class="flex items-center">
                    <Card class="mt-3">
                        <template #title>
                            {{ slotProps.item.title }}
                        </template>
                        <template #subtitle v-if="slotProps.item.subtitle">
                            {{ slotProps.item.subtitle }}
                        </template>
                        <template #content>
                            <NuxtImg provider="cloudinary"
                                :src="slotProps.item.image"
                                :alt="slotProps.item.title"
                                width="600"
                                height="600"
                                fit="fill"
                                class="shadow-1" />
                            <p v-if="slotProps.item.description" class="mb-2 text-justify">
                                {{ slotProps.item.description }}
                            </p>
                            <Button :label="slotProps.item.status" outlined></Button>
                        </template>
                    </Card>
                </template>
            </Timeline>
        </div>
    </div>

    <div class="container grid grid-cols-12 p-5">
        <div class="col-span-12 md:col-span-4
            flex items-start justify-center">
            <NuxtImg provider="cloudinary"
                src="/images/organizational-chart/18183203.jpg"
                width="600"
                height="600"
                fit="cover" />
        </div>
        <div class="col-span-12 md:col-span-8">
            <Card class="shadow-lg bordered">
                <template #content>
                    <!-- <div class="flex justify-end gap-2 mb-2">
                        <Button @click="tab_active = 0" rounded label="1" :outlined="tab_active !== 0" />
                        <Button @click="tab_active = 1" rounded label="2" :outlined="tab_active !== 1" />
                        <Button @click="tab_active = 2" rounded label="3" :outlined="tab_active !== 2" />
                        <Button @click="tab_active = 3" rounded label="4" :outlined="tab_active !== 3" />
                        <Button @click="tab_active = 4" rounded label="5" :outlined="tab_active !== 4" />
                        <Button @click="tab_active = 5" rounded label="6" :outlined="tab_active !== 5" />
                        <Button @click="tab_active = 6" rounded label="7" :outlined="tab_active !== 6" />
                    </div> -->

                    <TabView v-model:activeIndex="tab_active" scrollable>
                        <TabPanel header="Service">
                            <div class="overflow-x-auto">
                                <OrganizationChart :value="org_chart_service" collapsible>
                                    <template #person="slotProps">
                                        <div class="flex flex-col items-center">
                                            <NuxtImg provider="cloudinary"
                                                :src="slotProps.node.data.image"
                                                :alt="slotProps.node.data.name"
                                                width="100"
                                                height="100"
                                                class="mb-3 rounded-full" />
                                            <span class="font-medium text-sm mb-2">{{ slotProps.node.data.name }}</span>
                                            <span class="text-sm">{{ slotProps.node.data.title }}</span>
                                        </div>
                                    </template>
                                </OrganizationChart>
                            </div>
                        </TabPanel>
                        <TabPanel header="Medical Center Chief Office">
                            <div class="overflow-x-auto h-96">
                                <OrganizationChart :value="org_chart_mcco" collapsible>
                                    <template #default="slotProps">
                                        <span class="text-sm">{{ slotProps.node.label }}</span>
                                    </template>
                                </OrganizationChart>
                            </div>
                        </TabPanel>
                        <TabPanel header="Medical Service">
                            <div class="overflow-x-auto">
                                <OrganizationChart :value="org_chart_medical" collapsible>
                                    <template #default="slotProps">
                                        <span class="text-sm">{{ slotProps.node.label }}</span>
                                    </template>
                                </OrganizationChart>
                            </div>
                        </TabPanel>
                        <TabPanel header="Nursing Service">
                            <div class="overflow-x-auto">
                                <OrganizationChart :value="org_chart_nursing" collapsible>
                                    <template #default="slotProps">
                                        <span class="text-sm">{{ slotProps.node.label }}</span>
                                    </template>
                                </OrganizationChart>
                            </div>
                        </TabPanel>
                        <TabPanel header="Allied Health Professional Service">
                            <div class="overflow-x-auto">
                                <OrganizationChart :value="org_chart_allied" collapsible>
                                    <template #default="slotProps">
                                        <span class="text-sm">{{ slotProps.node.label }}</span>
                                    </template>
                                </OrganizationChart>
                            </div>
                        </TabPanel>
                        <TabPanel header="Finance Service">
                            <div class="overflow-x-auto">
                                <OrganizationChart :value="org_chart_finance" collapsible>
                                    <template #default="slotProps">
                                        <span class="text-sm">{{ slotProps.node.label }}</span>
                                    </template>
                                </OrganizationChart>
                            </div>
                        </TabPanel>
                        <TabPanel header="Hospital Operations and Patient Support Service">
                            <div class="overflow-x-auto">
                                <OrganizationChart :value="org_chart_hopss" collapsible>
                                    <template #default="slotProps">
                                        <span class="text-sm">{{ slotProps.node.label }}</span>
                                    </template>
                                </OrganizationChart>
                            </div>
                        </TabPanel>
                    </TabView>
                </template>
            </Card>
        </div>
    </div>

</template>
<style scoped>
    @media screen and (max-width: 960px) {
        ::v-deep(.customized-timeline) {
            .p-timeline-event:nth-child(even) {
                flex-direction: row;

                .p-timeline-event-content {
                    text-align: left;
                }
            }

            .p-timeline-event-opposite {
                flex: 0;
            }
        }
    }
</style>