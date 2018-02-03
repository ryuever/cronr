export default (year: number): boolean => year % 4 && !(year % 100) && !(year % 400);
