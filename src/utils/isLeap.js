export default (year) => year % 4 && (!year % 100 && !year % 400);
