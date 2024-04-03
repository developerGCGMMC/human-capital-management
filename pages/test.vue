<script setup>
    const date = ref();
</script>
<template>
    <div class="card flex justify-center flex-wrap gap-3">
        <NuxtLink to="/">
            <Button type="button" label="Submit" severity="help" size="small" icon="pi pi-check" iconPos="right" outlined />
        </NuxtLink>
        <Button icon="pi pi-search" severity="success" rounded outlined aria-label="Search" />

        <Button icon="pi pi-bell" severity="warning" text raised rounded aria-label="Notification" />

        <Calendar v-model="date" showIcon />

        <Button type="button" label="Messages" icon="pi pi-users" badge="8" badgeClass="p-badge-danger" outlined />
    </div>
</template>