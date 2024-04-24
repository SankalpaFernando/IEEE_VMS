export const getCustomErrorMsg = (error) => {
    switch(error.code) {
        case 23505:
            return "The Key already exists";
        default:
            return "An error occured";
    }
}