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
    <Listbox :options="daily_time_record.groupedBiometrics" optionLabel="checkDate"
        optionGroupChildren="biometrics" optionGroupLabel="checkTime"
        emptyMessage="No biometrics data"
        disabled
        class="w-full text-sm pa-0">
        <template #header>
            <div class="flex items-center justify-center w-full h-6">Biometrics In & Out</div>
        </template>
        <template #optiongroup="slotProps">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-1">
                    <i class="pi pi-calendar" style="font-size: 0.85rem"></i>
                    <p>{{ moment(slotProps.option.checkDate).format("MMMM D, YYYY") }}</p>
                </div>
                <p>{{ moment(slotProps.option.checkDate).format("dddd") }}</p>
            </div>
        </template>
        <template #option="slotProps">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-1">
                    <i class="pi pi-clock" style="font-size: 0.85rem"></i>
                    <p>{{ moment(slotProps.option.checkTime).format('hh:mm A') }}</p>
                </div>
                <div class="flex items-center gap-1">
                    <p class="capitalize">{{ slotProps.option.checkType }}</p>
                    <i class="pi pi-sign-in" style="font-size: 0.85rem"></i>
                </div>
            </div>
        </template>
    </Listbox>
</template>