export default defineEventHandler(async (event) => {
    console.log('[API] upload');

    const file = event.context.params.file;

    console.log(file);

    // event.target.files.forEach((file) => {
    //     console.log(file.name);
    // });
});