<script setup>
    import moment from 'moment';

    defineProps({
        daily_time_record: {
            type: Object,
            required: true
        }
    });
</script>
<template>
    <Listbox :options="daily_time_record.groupedSchedules" optionLabel="scheduleDate"
        optionGroupChildren="schedules" optionGroupLabel="schedules.scheduleName"
        emptyMessage="No assigned schedules"
        disabled
        class="w-full text-sm pa-0">
        <template #header>
            <div class="flex items-center justify-center w-full h-6">Schedules</div>
        </template>
        <template #optiongroup="slotProps">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-1">
                    <i class="pi pi-calendar" style="font-size: 0.85rem"></i>
                    <p>{{ moment(slotProps.option.scheduleDate).format("MMMM D, YYYY") }}</p>
                </div>
                <p>{{ moment(slotProps.option.scheduleDate).format("dddd") }}</p>
            </div>
        </template>
        <template #option="slotProps">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-1">
                    <i class="pi pi-bookmark" style="font-size: 0.85rem"></i>
                    <p>{{ slotProps.option.schedules.scheduleName }}</p>
                </div>
            </div>
        </template>
    </Listbox>
</template>