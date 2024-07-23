export default function useSupabaseAuthentication() {
    const client = useSupabaseClient();

    const signUp = async (sign_up) => {
        try {
            const { data, error } = await client.auth.signUp({
                email: sign_up.email,
                password: sign_up.password
            });

            if(error) throw error;

            // console.info(data);

            return {
                status: 'success',
                message: 'User successfully registered. Logging in.',
                data: data.user
            };
        } catch(error) {
            console.error(error.message);

            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    };

    const signInWithEmail = async (sign_in) => {
        try {
            const { data, error } = await client.auth.signInWithPassword({
                email: sign_in.email,
                password: sign_in.password
            });

            if(error) throw error;

            // console.info(data);

            return {
                status: 'success',
                message: 'Authentication successful. Redirecting to dashboard..',
                data: data
            };
        } catch(error) {
            console.error(error.message);

            return {
                status: 'error',
                message: error.message,
                data: null
            };
        }
    };

    const signOut = async () => {
        try {
            const { error } = await client.auth.signOut();

            if(error) throw error;

        } catch(error) {
            console.error(error.message);
        }
    };

    return {
        signUp,
        signInWithEmail,
        signOut
    }
}