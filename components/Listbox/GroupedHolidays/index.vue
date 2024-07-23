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
    <Listbox :options="daily_time_record.groupedHolidays" optionLabel="holidayDate"
        optionGroupChildren="holidays" optionGroupLabel="holidays.holidayName"
        emptyMessage="No holiday"
        disabled
        class="w-full text-sm pa-0">
        <template #header>
            <div class="flex items-center justify-center w-full h-6">Holidays</div>
        </template>
        <template #optiongroup="slotProps">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-1">
                    <i class="pi pi-calendar" style="font-size: 0.85rem"></i>
                    <p>{{ moment(slotProps.option.holidayDate).format("MMMM D, YYYY") }}</p>
                </div>
                <p>{{ moment(slotProps.option.holidayDate).format("dddd") }}</p>
            </div>
        </template>
        <template #option="slotProps">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-1">
                    <i class="pi pi-star" style="font-size: 0.85rem"></i>
                    <p>{{ slotProps.option.holidayName }}</p>
                </div>
            </div>
        </template>
    </Listbox>
</template>