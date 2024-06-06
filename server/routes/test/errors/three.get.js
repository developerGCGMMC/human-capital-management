export default defineEventHandler(async (event) => {
    throw ({
        name: 'error_name',
        message: '[Error] throw new Error',
        status:'error_status'
    });
});