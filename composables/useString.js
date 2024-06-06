export default function useString() {
    const isEmail = (email) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
    };

    const isAlphanumeric = (string) => {
        // at least one lowercase [a-z]
        // at least one uppercase [A-Z]
        // at least one numeric [0-9]
        // range of 8-15 characters
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{8,15}$/.test(string);
    };

    const toTitleCase = (phrase) => {
        return phrase.trim()
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return {
        isEmail,
        isAlphanumeric,
        toTitleCase
    }
};