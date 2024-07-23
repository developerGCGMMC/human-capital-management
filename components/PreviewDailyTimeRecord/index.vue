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
    <div class="border-2 pb-10 rounded-lg border-slate-600 w-full flex flex-col">
        <div class="p-2 border-b-2 border-slate-600 flex flex-col">
            <div class="w-full flex items-center justify-start">
                <span class="font-medium text-xs italic">Civil Service Form No. 48</span>
            </div>
            <div class="w-full flex items-center justify-center mt-8">
                <span class="font-bold text-2xl tracking-wider">DAILY TIME RECORD</span>
            </div>
            <div class="w-full flex items-center flex-col mt-4">
                <span class="text-xl font-medium underline uppercase">&nbsp;{{ daily_time_record.employeeDetail.fullName }}&nbsp;</span>
                <span class="text-sm">(Name)</span>
            </div>
            <div class="w-full flex items-center justify-center mt-3">
                <span class="font-lg font-medium">For the month of</span>&nbsp;
                <span class="font-lg font-semibold">{{ daily_time_record.file.header.month }}</span>
            </div>
            <div class="w-full flex items-center flex-col">
                <span class="font-lg font-medium">Official hours for arrival and departure</span>
                <span class="font-lg font-medium">Regular days __________________________</span>
                <span class="font-lg font-medium">Saturdays _____________________________</span>
            </div>
        </div>
        <div class="w-full">
            <div class="grid grid-cols-12">
                <div class="col-span-1 row-span-2 border-b-2 border-r-2 border-slate-600 flex items-center justify-center font-medium">Day</div>
                <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                    <div class="col-span-12 border-b-2 border-slate-600 flex items-center justify-center font-medium">A.M.</div>
                    <div class="col-span-6 border-r-2 border-slate-600 flex items-center justify-center font-medium">Arrival</div>
                    <div class="col-span-6 flex items-center justify-center font-medium">Departure</div>
                </div>
                <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                    <div class="col-span-12 border-b-2 border-slate-600 flex items-center justify-center font-medium">P.M.</div>
                    <div class="col-span-6 border-r-2 border-slate-600 flex items-center justify-center font-medium">Arrival</div>
                    <div class="col-span-6 flex items-center justify-center font-medium">Departure</div>
                </div>
                <div class="col-span-3 border-b-2 border-slate-600 grid grid-cols-12">
                    <div class="col-span-12 border-b-2 border-slate-600 flex items-center justify-center font-medium">UNDERTIME</div>
                    <div class="col-span-6 border-r-2 border-slate-600 flex items-center justify-center font-medium">Hours</div>
                    <div class="col-span-6 flex items-center justify-center font-medium">Minutes</div>
                </div>
            </div>

            <div v-for="previewBody in daily_time_record.previewBody" class="w-full">
                <template v-if="previewBody.dayType === 'schedule'">
                    <div v-for="daySlot in previewBody.daySlots" class="w-full text-sm">

                        <div v-if="daySlot.scheduleCategory === 'fromMidnight'"
                            class="grid grid-cols-12">
                            <div class="col-span-1 row-span-2 border-b-2 border-r-2 border-slate-600 flex items-center justify-center">
                                {{ daySlot.scheduleSlots.dayNo }}
                            </div>
                            <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 min-h-5 border-r-2 border-slate-600"></div>
                                <div class="col-span-6 min-h-5"></div>
                            </div>
                            <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ daySlot.scheduleSlots.firstDay.pm.in }}</div>
                                <div class="col-span-6 min-h-5"></div>
                            </div>
                            <div class="col-span-3 row-span-2 border-b-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 border-r-2 border-slate-600 flex items-center justify-center">{{ daySlot.scheduleSlots.undertime.hours }}</div>
                                <div class="col-span-6 flex items-center justify-center">{{ daySlot.scheduleSlots.undertime.minutes }}</div>
                            </div>

                            <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ daySlot.scheduleSlots.secondDay.am.in }}</div>
                                <div class="col-span-6 min-h-5 flex items-center justify-center">{{ daySlot.scheduleSlots.secondDay.am.out }}</div>
                            </div>
                            <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 min-h-5 border-r-2 border-slate-600"></div>
                                <div class="col-span-6 min-h-5"></div>
                            </div>
                        </div>

                        <div v-if="daySlot.scheduleCategory === 'noBreak'"
                            class="grid grid-cols-12">
                            <div class="col-span-1 min-h-5 border-b-2 border-r-2 border-slate-600 flex items-center justify-center">
                                {{ daySlot.scheduleSlots.dayNo }}
                            </div>
                            <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ daySlot.scheduleSlots.firstDay.am.in }}</div>
                                <div class="col-span-6 min-h-5 flex items-center justify-center">{{ daySlot.scheduleSlots.firstDay.am.out }}</div>
                            </div>
                            <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ daySlot.scheduleSlots.firstDay.pm.in }}</div>
                                <div class="col-span-6 min-h-5 flex items-center justify-center">{{ daySlot.scheduleSlots.firstDay.pm.out }}</div>
                            </div>
                            <div class="col-span-3 border-b-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ daySlot.scheduleSlots.undertime.hours }}</div>
                                <div class="col-span-6 min-h-5 flex items-center justify-center">{{ daySlot.scheduleSlots.undertime.minutes }}</div>
                            </div>
                        </div>

                        <div v-if="daySlot.scheduleCategory === 'oneBreak'"
                            class="grid grid-cols-12">
                            <div class="col-span-1 min-h-5 border-b-2 border-r-2 border-slate-600 flex items-center justify-center">
                                {{ daySlot.scheduleSlots.dayNo }}
                            </div>
                            <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ daySlot.scheduleSlots.firstDay.am.in }}</div>
                                <div class="col-span-6 min-h-5 flex items-center justify-center">{{ daySlot.scheduleSlots.firstDay.am.out }}</div>
                            </div>
                            <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ daySlot.scheduleSlots.firstDay.pm.in }}</div>
                                <div class="col-span-6 min-h-5 flex items-center justify-center">{{ daySlot.scheduleSlots.firstDay.pm.out }}</div>
                            </div>
                            <div class="col-span-3 border-b-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ daySlot.scheduleSlots.undertime.hours }}</div>
                                <div class="col-span-6 min-h-5 flex items-center justify-center">{{ daySlot.scheduleSlots.undertime.minutes }}</div>
                            </div>
                        </div>

                        <div v-if="daySlot.scheduleCategory === 'toMidnight'"
                            class="grid grid-cols-12">
                            <div class="col-span-1 row-span-2 border-b-2 border-r-2 border-slate-600 flex items-center justify-center">
                                {{ daySlot.scheduleSlots.dayNo }}
                            </div>
                            <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 min-h-5 border-r-2 border-slate-600"></div>
                                <div class="col-span-6 min-h-5"></div>
                            </div>
                            <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ daySlot.scheduleSlots.firstDay.pm.in }}</div>
                                <div class="col-span-6 min-h-5 flex items-center justify-center">{{ daySlot.scheduleSlots.firstDay.pm.out }}</div>
                            </div>
                            <div class="col-span-3 row-span-2 border-b-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 border-r-2 border-slate-600 flex items-center justify-center">{{ daySlot.scheduleSlots.undertime.hours }}</div>
                                <div class="col-span-6 flex items-center justify-center">{{ daySlot.scheduleSlots.undertime.minutes }}</div>
                            </div>

                            <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 min-h-5 border-r-2 border-slate-600"></div>
                                <div class="col-span-6 min-h-5 flex items-center justify-center">{{ daySlot.scheduleSlots.secondDay.am.out }}</div>
                            </div>
                            <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 min-h-5 border-r-2 border-slate-600"></div>
                                <div class="col-span-6 min-h-5"></div>
                            </div>
                        </div>

                        <div v-if="daySlot.scheduleCategory === 'twoDays'"
                            class="grid grid-cols-12">
                            <div class="col-span-1 row-span-2 border-b-2 border-r-2 border-slate-600 flex items-center justify-center">
                                {{ daySlot.scheduleSlots.dayNo }}
                            </div>
                            <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 min-h-5 border-r-2 border-slate-600"></div>
                                <div class="col-span-6 min-h-5"></div>
                            </div>
                            <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ daySlot.scheduleSlots.firstDay.pm.in }}</div>
                                <div class="col-span-6 min-h-5 flex items-center justify-center">{{ daySlot.scheduleSlots.firstDay.pm.out }}</div>
                            </div>
                            <div class="col-span-3 row-span-2 border-b-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 border-r-2 border-slate-600 flex items-center justify-center">{{ daySlot.scheduleSlots.undertime.hours }}</div>
                                <div class="col-span-6 flex items-center justify-center">{{ daySlot.scheduleSlots.undertime.minutes }}</div>
                            </div>

                            <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 min-h-5 border-r-2 border-slate-600 flex items-center justify-center">{{ daySlot.scheduleSlots.secondDay.am.in }}</div>
                                <div class="col-span-6 min-h-5 flex items-center justify-center">{{ daySlot.scheduleSlots.secondDay.am.out }}</div>
                            </div>
                            <div class="col-span-4 border-b-2 border-r-2 border-slate-600 grid grid-cols-12">
                                <div class="col-span-6 min-h-5 border-r-2 border-slate-600"></div>
                                <div class="col-span-6 min-h-5"></div>
                            </div>
                        </div>

                    </div>
                </template>
                <template v-else>
                    <div class="grid grid-cols-12 text-sm">
                        <div class="col-span-1 min-h-5 border-b-2 border-r-2 border-slate-600 flex items-center justify-center">
                            {{ moment(previewBody.dayDate).format('D') }}
                        </div>
                        <div class="col-span-8 min-h-5 border-b-2 border-r-2 border-slate-600 flex items-center justify-center">
                            {{ previewBody.dayName }}
                        </div>
                        <div class="col-span-3 border-b-2 border-slate-600 grid grid-cols-12">
                            <div class="col-span-6 min-h-5 border-r-2 border-slate-600"></div>
                            <div class="col-span-6 min-h-5"></div>
                        </div>
                    </div>
                </template>
            </div>

            <div class="border-b-2 border-slate-600 w-full grid grid-cols-12">
                <div class="col-span-12 flex items-center justify-center font-medium">TOTAL</div>
            </div>

            <div class="flex flex-col items-center justify-center pt-5 px-5">
                <p class="indent-8 italic text-justify">I CERTIFY on my honor that the above is a true and correct report of the hours of work performed, record of which was made daily at the time of arrival and departure from office.</p>
                <span class="mt-10 text-lg">___________________________________</span>
                <span class="italic text-xs">Signature</span>
                <span class="mt-8 italic">VERIFIED as to the prescribed office hours:</span>
                <span class="mt-10 font-medium underline uppercase">&nbsp;{{ daily_time_record.file.footer.service_signatory?.signatoryName }}&nbsp;</span>
                <span class="italic text-xs">In-Charge</span>
            </div>
        </div>
    </div>
</template>