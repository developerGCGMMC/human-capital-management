<script setup>
    definePageMeta({
        layout: 'panel'
    });

    const user = useSupabaseUser();

    import { csvParse } from "d3-dsv";
    import moment from 'moment';

    // const attributes = useAttrs();
    // const test = useAttrs().test;
    // console.log('attr: '+JSON.stringify(test));

    // ! ----------------------------------------------------------------------------------------------------

    const pendings = reactive({
        reading_csv: false
    });

    const biometricsCSV = ref([]);
    const data_count = ref(0);

    // ! ----------------------------------------------------------------------------------------------------

    const onUpload = async (event) => {
        console.log('onUpload');

        pendings.reading_csv = true;

        const reader = new FileReader();

        reader.readAsText(event.files[0], 'UTF-8');

        reader.onloadstart = () => {
            console.log('onloadstart');
        };

        reader.onprogress = () => {
            console.log('onprogress');
            pendings.reading_csv = true;
        };

        const date_today = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        console.log('date_today: '+date_today);

        reader.onload = async (e) => {
            console.log('onload');

            const rows = e.target.result;
            const data = await csvParse(rows);

            biometricsCSV.value = data.reduce((accumulator, currentData) => {
                data_count.value += 1;
                console.log('data_count: '+data_count.value);

                const format_check_time = (currentData.check_time && moment(currentData.check_time).isValid())
                    ? moment(currentData.check_time).format('YYYY-MM-DD HH:mm:ss')
                    : null;
                const isLessThanStartDay = moment(format_check_time).isSameOrAfter('2024-04-01 00:00:00');
                const isGreaterThanToday = moment(format_check_time).isSameOrBefore(date_today);

                if((currentData.biometrics_no && currentData.biometrics_no <= 9999)
                    && (format_check_time && isLessThanStartDay && isGreaterThanToday)
                    && (currentData.check_type)) {
                    accumulator.push({
                        ...currentData,
                        check_time: format_check_time
                    });
                }

                return accumulator;
            }, []).sort((prev, next) => {
                return prev.check_time > next.check_time
                    ? -1
                    : (prev.check_time < next.check_time
                        ? 1
                        : 0
                    );
            });

            pendings.reading_csv = false;
        };

        reader.onloadend = () => {
            console.log('onloadend');
        };

        // event.files.forEach((file) => {
        //     console.log(file.name);
        // });
    };


    // ! ----------------------------------------------------------------------------------------------------

    onMounted(async () => {
        watchEffect(async () => {
            if(!user.value) {
                await navigateTo('/');
            }
        });

        // ! ----------------------------------------------------------------------------------------------------
    });
</script>
<template>
    <div class="container p-4 text-sm">
        <FileUpload mode="basic" name="demo[]" url="/api/upload/biometrics" accept=".csv" customUpload @uploader="onUpload($event)" />

        <p>{{ pendings.reading_csv }}</p>
        <p>{{ biometricsCSV.length }} of {{ data_count }}</p>
        <div class="grid grid-cols-12 gap-2">
            <div v-if="pendings.reading_csv" class="col-span-12">
                <ProgressBar mode="indeterminate" style="height: 4px" />
            </div>
        </div>
        <div v-for="biometric in biometricsCSV" class="grid grid-cols-12 gap-2">
            <div class="col-span-4">
                <span>{{ biometric.biometrics_no }}</span>
            </div>
            <div class="col-span-4">
                <span>{{ biometric.check_time }}</span>
            </div>
            <div class="col-span-4">
                <span>{{ biometric.check_type }}</span>
            </div>
        </div>
    </div>
</template>