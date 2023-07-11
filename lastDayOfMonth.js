
// const currentDate = new Date('2023-07-31');
const currentDate = new Date();

// Get the current day and month
const currentDay = currentDate.getDate();
const currentMonth = currentDate.getMonth();

// Total Number of days in a month - Thanks chat GPT
const lastDayOfMonth = new Date(currentDate.getFullYear(), currentMonth + 1, 0).getDate();

// Checking if the current day is the last day
const isLastDayOfMonth = currentDay === lastDayOfMonth;

// Export the result as a Node.js module
module.exports = isLastDayOfMonth;