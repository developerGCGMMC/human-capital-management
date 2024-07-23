<script setup>
    const user = useSupabaseUser();

    const { isEmail, isAlphanumeric }  = useString();
    const { signInWithEmail }  = useSupabaseAuthentication();

    const toast = useToast();

    // ! ----------------------------------------------------------------------------------------------------

    const loading = reactive({
        sign_in: false
    });
    const form = reactive({
        sign_in: {
            email: null,
            password: null
        },
        show_password: false
    });
    const error = reactive({
        validation: {
            status: null,
            message: null
        }
    });
    const show = reactive({
        password: false
    });

    // ! ----------------------------------------------------------------------------------------------------

    const validateLogin = async () => {
        error.validation.status = null;
        error.validation.message = null;

        if(!form.sign_in.email) {
            error.validation.status = 'error';
            error.validation.message = 'Email required.';
        } else if(isEmail(form.sign_in.email) === false) {
            error.validation.status = 'error';
            error.validation.message = 'Email invalid.';
        } else if(!form.sign_in.password) {
            error.validation.status = 'error';
            error.validation.message = 'Password required.';
        } else if(isAlphanumeric(form.sign_in.password) === false ) {
            error.validation.status = 'error';
            error.validation.message = 'Password must be alphanumeric [a-z, A-Z, 0-9].';
        }

        if(error.validation.status === 'error') {
            toast.add({ severity: 'error', summary: 'Error', detail: error.validation.message, life: 3000 });

            return false;
        }

        // ! ----------------------------------------------------------------------------------------------------

        loading.sign_in = true;

        const { status, message, data } = await signInWithEmail(form.sign_in);

        // console.log(status);
        // console.log(message);
        // console.log(data);

        toast.add({ severity: status, summary: status === 'success' ? 'Success' : 'Error', detail: message, life: 3000 });

        loading.sign_in = false;
    };

    // ! ----------------------------------------------------------------------------------------------------

    onMounted(() => {
        watchEffect(async () => {
            if(user.value) {
                await navigateTo('/panel/user');
            }
        });
    });
</script>
<template>
    <Toast />

    <div class="container min-h-screen py-5
        flex justify-center items-center"
        style="background-color: var(--primary-50); color: var(--primary-500);">
        <div class="w-11/12 md:w-1/2">
            <Fieldset>
                <template #legend>
                    <div class="flex items-center pl-3 border rounded" style="background-color: var(--primary-50); color: var(--primary-500);">
                        <i class="pi pi-user" style="font-size: 1.2rem"></i>
                        <span class="font-medium text-sm md:text-base">User Login</span>
                    </div>
                </template>
                <div class="flex flex-col md:flex-row">
                    <div class="w-full md:w-2/3">
                        <NuxtImg provider="cloudinary"
                            src="/images/authentication/19170107.jpg"
                            width="400"
                            height="400"
                            fit="fill" />
                    </div>
                    <div class="w-full md:w-1/3 flex items-center">
                        <div class="w-full flex flex-col gap-1">
                            <label for="form_email" class="text-sm md:text-base">Email</label>
                            <InputGroup>
                                <InputText v-model="form.sign_in.email" @keyup.enter="validateLogin()" inputId="form_email" />
                                <InputGroupAddon>
                                    <i class="pi pi-user"></i>
                                </InputGroupAddon>
                            </InputGroup>

                            <label for="form_password" class="text-sm md:text-base">Password</label>
                            <InputGroup>
                                <InputText v-if="!show.password" v-model="form.sign_in.password" type="password" @keyup.enter="validateLogin()" inputId="form_password" />
                                <InputText v-else v-model="form.sign_in.password" type="text" @keyup.enter="validateLogin()" inputId="form_password" />

                                <InputGroupAddon @click="show.password = !show.password" class="cursor-pointer">
                                    <i :class="!show.password ? 'pi pi-eye-slash' : 'pi pi-eye'" />
                                </InputGroupAddon>
                            </InputGroup>

                            <ProgressBar v-if="loading.sign_in" mode="indeterminate" style="height: 4px"></ProgressBar>

                            <Button @click="validateLogin()" type="button" label="Login" raised class="w-full py-3 text-base mt-5" />
                            <Divider align="center" type="solid">
                                <small>Not yet registered?</small>
                            </Divider>
                            <NuxtLink to="/register">
                                <Button type="button" label="Register" outlined
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