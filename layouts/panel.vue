<script setup>
    const user = useSupabaseUser();

    const { signOut }  = useSupabaseAuthentication();

    const menubar_items = ref([
        {
            label: 'Home',
            icon: 'pi pi-home',
            command: () => {
                navigateTo('/');
            }
        },
        {
            label: 'Panel',
            icon: 'pi pi-desktop',
            items: [
                {
                    label: 'User',
                    icon: 'pi pi-user',
                    command: () => {
                        navigateTo('/panel/user');
                    },
                    items: [
                        {
                            label: 'Daily Time Record',
                            icon: 'pi pi-book',
                            command: () => {
                                navigateTo('/user/daily-time-record');
                            }
                        },
                        {
                            label: 'Leave Application',
                            icon: 'pi pi-briefcase',
                            command: () => {
                                navigateTo('/user/leave-application');
                            }
                        },
                        {
                            label: 'Profile',
                            icon: 'pi pi-user-edit',
                            command: () => {
                                navigateTo('/user/profile');
                            }
                        }
                    ]
                },
                {
                    label: 'Administrator',
                    icon: 'pi pi-cog',
                    command: () => {
                        navigateTo('/panel/administrator');
                    },
                    items: [
                        {
                            label: 'Time Keeping',
                            icon: 'pi pi-book',
                            command: () => {
                                navigateTo('/admin/time-keeping');
                            }
                        },
                        {
                            label: 'Leave Management',
                            icon: 'pi pi-briefcase'
                        },
                        {
                            label: 'Payroll Management',
                            icon: 'pi pi-calculator'
                        },
                        {
                            label: 'Employee Management',
                            icon: 'pi pi-users',
                            command: () => {
                                navigateTo('/admin/employee-management');
                            }
                        },
                        {
                            label: 'User Management',
                            icon: 'pi pi-user-plus',
                            command: () => {
                                navigateTo('/test');
                            }
                        },
                        {
                            label: 'Biometrics Uploader',
                            icon: 'pi pi-cloud-upload',
                            command: () => {
                                navigateTo('/admin/biometrics-uploader');
                            }
                        },
                        {
                            label: 'Reports',
                            icon: 'pi pi-chart-bar'
                        }
                    ]
                }
            ]
        }
    ]);

    const sidebar_visibility = ref(false);
    const sidebar_items = ref([
        {
            separator: true
        },
        {
            label: 'User',
            items: [
                {
                    label: 'Daily Time Record',
                    icon: 'pi pi-book',
                    shortcut: '✨',
                    // shortcut: '✅',
                    command: () => {
                        navigateTo('/user/daily-time-record');
                    }
                },
                {
                    label: 'Leave Application',
                    icon: 'pi pi-briefcase',
                    shortcut: '❎',
                    command: () => {
                        navigateTo('/user/leave-application');
                    }
                },
                {
                    label: 'Profile',
                    icon: 'pi pi-user-edit',
                    shortcut: '❎',
                    command: () => {
                        navigateTo('/user/profile');
                    }
                }
            ]
        },
        {
            separator: true
        },
        {
            label: 'Administrator',
            items: [
                {
                    label: 'Time Keeping',
                    icon: 'pi pi-book',
                    shortcut: '✨',
                    command: () => {
                        navigateTo('/admin/time-keeping');
                    }
                },
                {
                    label: 'Leave Management',
                    icon: 'pi pi-briefcase',
                    shortcut: '❎'
                },
                {
                    label: 'Payroll Management',
                    icon: 'pi pi-calculator',
                    shortcut: '❎'
                },
                {
                    label: 'Employee Management',
                    icon: 'pi pi-users',
                    shortcut: '✨',
                    command: () => {
                        navigateTo('/admin/employee-management');
                    }
                },
                {
                    label: 'User Management',
                    icon: 'pi pi-user-plus',
                    shortcut: '❎',
                    command: () => {
                        navigateTo('/test');
                    }
                },
                {
                    label: 'Biometrics Uploader',
                    icon: 'pi pi-cloud-upload',
                    shortcut: '✨',
                    command: () => {
                        navigateTo('/admin/biometrics-uploader');
                    }
                },
                {
                    label: 'Reports',
                    icon: 'pi pi-chart-bar',
                    shortcut: '❎'
                }
            ]
        },
        {
            separator: true
        },
        {
            label: 'Settings',
            items: [
                {
                    label: 'Change Password',
                    icon: 'pi pi-key',
                    shortcut: '❎'
                },
                {
                    label: 'Logout',
                    icon: 'pi pi-sign-out',
                    command: () => {
                        signOut();
                    }
                }
            ]
        }
    ]);

    const avatar_link = 'https://res.cloudinary.com/dtcgyjwzt/image/upload/v1709782922/avatar/employees/';

    // ! ----------------------------------------------------------------------------------------------------

    const pendings = reactive({
        fetch_user_auth: false
    });

    // ! ----------------------------------------------------------------------------------------------------

    const user_auth = ref(null);

    const { execute: fetchUsersAuth } = await useFetch('/api/users/auth', {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            user_id: user?.value?.id
        }),
        immediate: false,
        watch: false,

        async onRequest() {
            pendings.fetch_user_auth = true;
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
            // console.log('[onResponse] fetchUsersAuth: '+JSON.stringify(response._data));

            user_auth.value = response._data;

            pendings.fetch_user_auth = false;
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
        if(user.value) {
            fetchUsersAuth();
        }
    });

    // const storage_user = ref(null);
    // const user_auth = ref();

    // watch(() => storage_user?.value?.id, async () => {
    //     const { data, error } = await useFetch('/api/users/auth', {
    //         method: 'POST',
    //         headers: {
    //             'Accept': 'application/json'
    //         },
    //         body: JSON.stringify({
    //             user_id: storage_user.value.id
    //         })
    //     });

    //     if(error.value) {
    //         const { statusCode, statusMessage } = error?.value;

    //         console.groupCollapsed('Error Response: /api/users/auth')
    //         console.error(statusCode+': '+statusMessage);
    //         console.groupEnd();

    //         return;
    //     }

    //     // console.log(data.value.userEmail);
    //     user_auth.value = data.value;
    // });

    // onMounted(async () => {
    //     let storage_auth = JSON.parse(localStorage.getItem('sb-'+runtimeConfig.public.SUPABASE_REFERENCE_ID+'-auth-token'));

    //     storage_user.value = storage_auth.user;
    // });
</script>
<template>
    <div class="w-full min-h-screen">
        <Menubar :model="menubar_items"
            class="gap-2"
            style="background-color: var(--primary-50); color: var(--primary-500);">
            <template #start>
                <div class="flex-row items-center gap-1 hidden lg:flex">
                    <NuxtImg provider="cloudinary"
                        src="/logo/gcgmmc-logo-640.png"
                        height="26"
                        fit="fill" />
                    <span class="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-pink-500 to-purple-500">PYLON</span>
                </div>
            </template>
            <template #item="{ item, props, hasSubmenu, root }">
                <a v-ripple class="flex items-center" v-bind="props.action">
                    <span :class="item.icon" />
                    <span class="ml-2">{{ item.label }}</span>
                    <Badge v-if="item.badge" :class="{ 'ml-auto': !root, 'ml-2': root }" :value="item.badge" />
                    <span v-if="item.shortcut" class="ml-auto border-1 surface-border border-round surface-100 text-xs p-1">{{ item.shortcut }}</span>
                    <i v-if="hasSubmenu" :class="['pi pi-angle-down', { 'pi-angle-down ml-2': root, 'pi-angle-right ml-auto': !root }]"></i>
                </a>
            </template>
            <template #end>
                <div @click="sidebar_visibility = true" class="flex flex-row items-center gap-2 cursor-pointer">
                    <span v-if="user_auth">{{ user_auth?.employee?.firstName }} {{ user_auth?.employee?.lastName }}</span>
                    <Avatar v-if="user_auth?.employee?.biometricsNo" :image="avatar_link+''+user_auth?.employee?.biometricsNo+'.jpg'" size="large" shape="circle" class="border-2" style="border-color: var(--primary-300);" />
                </div>
            </template>
        </Menubar>

        <Sidebar v-model:visible="sidebar_visibility" position="right" :blockScroll="true">
            <template #container>
                <Menu :model="sidebar_items" class="w-full md:w-15rem border-0">
                    <template #start>
                        <div class="flex flex-col items-end cursor-pointer">
                            <span class="text-xl font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-pink-500 to-purple-500">PYLON</span>
                            <span class="text-yellow-400 tracking-wide text-lg">Human Capital Management</span>
                        </div>
                    </template>
                    <template #submenuheader="{ item }">
                        <span class="font-light">{{ item.label }}</span>
                    </template>
                    <template #item="{ item, props }">
                        <a v-ripple class="flex items-center" v-bind="props.action">
                            <span :class="item.icon" />
                            <span class="ml-2">{{ item.label }}</span>
                            <Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
                            <span v-if="item.shortcut" class="ml-auto border-1 surface-border border-round surface-100 text-xs p-1">{{ item.shortcut }}</span>
                        </a>
                    </template>
                </Menu>
            </template>
        </Sidebar>
        <slot />
    </div>
</template>