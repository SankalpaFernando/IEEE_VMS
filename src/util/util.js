export const getCustomGreeting = (name) =>{
    const time = new Date().getHours();
    let greeting = '';
    let emoji='';
    if(time>=0 && time<12){
        greeting='Good Morning';
        emoji='🌞';
    }else if(time>=12 && time<16){
        greeting='Good Afternoon';
        emoji='🌤️';
    }else if(time>=17 && time<18){
        greeting='Good Evening';
        emoji='🌇';
    }else{
        greeting='Good Night';
        emoji='🌙';
    }

    return `${greeting},${name} ${emoji}`;

}


export const getMonthName = (month) =>{
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December']; 
    return months[month];
}
export const getMonthsBetweenDates = (startDate, endDate) => {

    console.log(startDate, endDate)
    let months = [];

    // Clone the start date to avoid modifying the original date
    let currentDate = new Date(startDate);

    // Iterate through the months until we reach the end date
    while (currentDate < endDate) {
        // Get the month and year of the current date
        let month = currentDate.getMonth();
        let year = currentDate.getFullYear();

        // Push the month and year to the array if it's not already there
        if (!months.find(m => m.month === month && m.year === year)) {
            months.push({ month: month, year: year });
        }

        // Move to the next month
        currentDate.setMonth(month + 1);
    }
    console.log(months)
    return months;
}
export const getScorePointsForProjectType = (type) =>{
    switch(type){
        case 'Technical Session':
            return 0.4;
        case 'Non Technical Session':
            return 0.5;
        case 'Workshop Session':
            return 0.6;
        case 'Session Series':
            return 0.8;
        case 'Adminstrative Session':
            return 0.2;
        case 'Fund Raise':
            return 1;
        case 'Outreach Project':
            return 0.9;
        default:
            return 0;
    }
}


export const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.match(/[a-z]+/)) {
        strength += 1;
    }
    if (password.match(/[A-Z]+/)) {
        strength += 1;
    }
    if (password.match(/[0-9]+/)) {
        strength += 1;
    }
    if (password.match(/[$@#&!]+/)) {
        strength += 1;
    }
    if (password.length > 6) {
        strength += 1;
    }
    return strength * 20;
}

export const getPasswordStrengthColor = (strength) => {
    if (strength <= 20) {
        return "danger";
    }
    if (strength <= 60) {
        return "warning";
    }
    if (strength <= 80) {
        return "success";
    }
    return "success";
}