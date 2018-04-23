const Cronr = require('../dist').default;

const noop = () => {};

const job = Cronr.create('2,15-50,4-12 * * 1-12 * 0', noop);
job.resolver.ts = new Date(2018, 2, 4, 10, 11, 16);

console.log('job : ', job.resolver.next());
console.log('job : ', job.resolver.next());
console.log('job : ', job.resolver.next());
console.log('job : ', job.resolver.next());
console.log('job : ', job.resolver.next());
