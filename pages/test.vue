<script setup>
    import Password from 'primevue/password';

    const date = ref();

    const value = ref(null);
</script>
<template>
    <!-- <div class="card flex justify-center flex-wrap gap-3">
        <NuxtLink to="/">
            <Button type="button" label="Submit" severity="help" size="small" icon="pi pi-check" iconPos="right" />
        </NuxtLink>

        <Button icon="pi pi-search" severity="success" rounded outlined aria-label="Search" />

        <Button icon="pi pi-bell" severity="warning" text raised rounded aria-label="Notification" />

        <Calendar v-model="date" inputId="date" showIcon />
    </div> -->

    <div class="grid grid-cols-12 gap-2">
        <div class="col-span-12 sm:col-span-12 md:col-span-4 lg:col-span-4 xl:col-span-4
            bg-blue-500 p-2 flex items-center justify-center">
            <div class="flex items-center justify-center p-3 bg-cyan-300">
                <InputText size="small" />
                <Button label="Save" icon="pi pi-check" size="small" severity="danger" />
            </div>
        </div>
        <div class="col-span-12 sm:col-span-12 md:col-span-4 lg:col-span-4 xl:col-span-4
            bg-indigo-300 p-2 flex items-center justify-center">
            <Password :modelValue="value" :feedback="false" />

            <NuxtLink to="/">
                <Button icon="pi pi-heart" severity="help" aria-label="Favorite" size="small" />
            </NuxtLink>
        </div>
        <div class="col-span-12 sm:col-span-12 md:col-span-4 lg:col-span-4 xl:col-span-4
            bg-green-800 p-2 flex items-center justify-center">
            <div class="p-3 bg-yellow-400 w-full flex justify-center">
                <Calendar v-model="date" inputId="date" showIcon />
            </div>
        </div>
    </div>

    <!-- <div class="card dock-demo">
        <div class="flex flex-wrap gap-3 mb-5">
            <div v-for="pos of positions" :key="pos.label" class="flex items-center">
                <RadioButton v-model="position" :value="pos.value" :inputId="pos.label" name="dock" />
                <label :for="pos.label" class="ml-2"> {{ pos.label }} </label>
            </div>
        </div>
        <div class="dock-window" style="backgroundimage: 'url(https://primefaces.org/cdn/primevue/images/dock/window.jpg))'">
            <Dock :model="items" :position="position">
                <template #icon="{ item }">
                    <img :alt="item.label" :src="item.icon" style="width: 100%" />
                </template>
            </Dock>
        </div>
    </div> -->
</template>