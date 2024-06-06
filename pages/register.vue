<script setup>
    // definePageMeta({
    //     middleware: ['auth']
    // });

    const { isEmail, isAlphanumeric }  = useString();
    const { signUp }  = useSupabaseAuthentication();

    const confirm = useConfirm();
    const toast = useToast();

    // ! ----------------------------------------------------------------------------------------------------

    const loading = reactive({
        sign_up: false
    });
    const form = reactive({
        sign_up: {
            email: null,
            password: null,
            confirm: null
        }
    });
    const error = reactive({
        validation: {
            status: null,
            message: null
        }
    });

    // ! ----------------------------------------------------------------------------------------------------

    const validateRegistration = (event) => {
        error.validation.status = null;
        error.validation.message = null;

        if(isEmail(form.sign_up.email) === false) {
            error.validation.status = 'error';
            error.validation.message = 'Email invalid.';
        } else if(isAlphanumeric(form.sign_up.password) === false || isAlphanumeric(form.sign_up.confirm) === false) {
            error.validation.status = 'error';
            error.validation.message = 'Password must be alphanumeric [a-z, A-Z, 0-9].';
        } else if(form.sign_up.password !== form.sign_up.confirm) {
            error.validation.status = 'error';
            error.validation.message = 'Password and Confirm Password does not match.';
        }

        if(error.validation.status === 'error') {
            toast.add({ severity: 'error', summary: 'Error', detail: error.validation.message, life: 3000 });

            return false;
        }

        confirmRegistration(event);
    };

    const confirmRegistration = (event) => {
        loading.sign_up = true;

        confirm.require({
            target: event.currentTarget,
            group: 'confirm_registration',
            message: 'Confirm registration to proceed',
            icon: 'pi pi-exclamation-circle',
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            acceptLabel: 'Confirm',
            rejectLabel: 'Cancel',
            rejectClass: 'p-button-outlined p-button-sm',
            acceptClass: 'p-button-sm',
            accept: async () => {
                const { status, message, data } = await signUp(form.sign_up);

                toast.add({ severity: status, summary: status === 'success' ? 'Success' : 'Error', detail: message, life: 3000 });

                loading.sign_up = false;
            },
            reject: () => {
                toast.add({ severity: 'warn', summary: 'Cancelled', detail: 'Registration cancelled.', life: 3000 });

                loading.sign_up = false;
            },
            onHide: () => {
                loading.sign_up = false;
            }
        });
    };

    // ! ----------------------------------------------------------------------------------------------------

    onMounted(() => {
        const user = useSupabaseUser();

        watchEffect(async () => {
            if(user.value) {
                await navigateTo('/panel/user');
            }
        });
    });
</script>
<template>
    <Toast />
    <ConfirmPopup group="confirm_registration">
        <template #message="slotProps">
            <div class="flex flex-col items-center w-full gap-3 border-bottom-1 surface-border p-3 mb-3 pb-0">
                <i :class="slotProps.message.icon" class="text-6xl" style="color: var(--primary-300);"></i>
                <p>{{ slotProps.message.message }}</p>
            </div>
        </template>
    </ConfirmPopup>

    <div class="container min-h-screen py-5
        flex justify-center items-center"
        style="background-color: var(--primary-50); color: var(--primary-500);">
        <div class="w-11/12 md:w-1/2">
            <Fieldset>
                <template #legend>
                    <div class="flex items-center pl-3 border rounded" style="background-color: var(--primary-50); color: var(--primary-500);">
                        <i class="pi pi-user" style="font-size: 1.2rem"></i>
                        <span class="font-medium text-sm md:text-base">User Registration</span>
                    </div>
                </template>
                <div class="flex flex-col md:flex-row">
                    <div class="w-full md:w-2/3">
                        <NuxtImg provider="cloudinary"
                            src="/images/authentication/17192810.jpg"
                            width="400"
                            height="400"
                            fit="fill" />
                    </div>
                    <div class="w-full md:w-1/3 flex items-center">
                        <div class="w-full flex flex-col gap-1">
                            <label for="email" class="text-sm md:text-base">Email</label>
                            <InputGroup>
                                <InputText v-model="form.sign_up.email" inputId="email" />
                                <InputGroupAddon>
                                    <i class="pi pi-at"></i>
                                </InputGroupAddon>
                            </InputGroup>

                            <label for="password" class="text-sm md:text-base">Password</label>
                            <Password v-model="form.sign_up.password" toggleMask inputId="password" inputClass="w-full">
                                <template #header>
                                    <h6>Pick a password</h6>
                                </template>
                                <template #footer>
                                    <Divider />
                                    <p class="mt-2">Requirements:</p>
                                    <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                                        <li>At least one lowercase [a-z]</li>
                                        <li>At least one uppercase [A-Z]</li>
                                        <li>At least one numeric [0-9]</li>
                                        <li>Between 8 to 15 characters</li>
                                    </ul>
                                </template>
                            </Password>

                            <label for="confirm_password" class="text-sm md:text-base">Confirm Password</label>
                            <Password v-model="form.sign_up.confirm" toggleMask :feedback="false" inputId="confirm_password" inputClass="w-full"></Password>

                            <ProgressBar v-if="loading.sign_up" mode="indeterminate" style="height: 4px"></ProgressBar>

                            <Button @click="validateRegistration($event)" type="button" label="Register" raised :disabled="loading.sign_up"
                                class="w-full py-3 text-base mt-5" />
                            <Divider align="center" type="solid">
                                <small>Already a user?</small>
                            </Divider>
                            <NuxtLink to="/login">
                                <Button type="button" label="Login" outlined
                                    class="w-full py-3 text-base" />
                            </NuxtLink>

                            <NuxtLink to="/" class="mt-5">
                                <Button type="button" label="back to Home page" text
                                    class="w-full py-5 text-base" />
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </Fieldset>
        </div>
    </div>
</template>