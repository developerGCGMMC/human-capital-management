import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event);

    try {
        const { data, error } = await supabase.from('employees')
            .select()
            .csv();

        return data;
    } catch(error) {
        console.error(error);

        return error;
    }
});