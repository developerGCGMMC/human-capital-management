<script setup>
    definePageMeta({
        // middleware: ['auth']
        layout: 'panel'
    });

    const runtimeConfig = useRuntimeConfig();

    const user = useSupabaseUser();

    const { signOut }  = useSupabaseAuthentication();

    const storage = reactive({
        local: {
            user: null
        }
    });

    onMounted(async () => {
        watchEffect(async () => {
            if(!user.value) {
                await navigateTo('/');
            }
        });

        let storage_auth = JSON.parse(localStorage.getItem('sb-'+runtimeConfig.public.SUPABASE_REFERENCE_ID+'-auth-token'));

        // console.log(storage_auth);

        storage.local.user = storage_auth.user;
    });
</script>
<template>
    <div class="flex flex-col gap-3">
        <span>User Panel</span>

        <!-- <span v-if="user">Hey {{ user?.id }} !</span>
        <span>Local: {{ storage.local.user?.id }}</span> -->

        <Button @click="signOut()" type="button" label="Signout" outlined
            class="py-3 text-base" />

        <!-- <NuxtImg provider="cloudinary"
            src="/avatar/employees/3624"
            width="400"
            height="400"
            fit="fill" /> -->
    </div>
</template>