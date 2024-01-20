const currentDate = new Date();
const options = { weekday: 'long' };
const currentDayOfWeekString = currentDate.toLocaleDateString('en-US', options);

console.log(currentDayOfWeekString); // Output: Monday