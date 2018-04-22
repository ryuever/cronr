import Cronr from '../src/Cronr';
const noop = () => {};

test('matchDateOrWeekday on sunday', () => {
  const croner = new Cronr({
    name: 'testing',
    // pattern: '2,15-50,4-12 * * 1-12 * *',
    pattern: '2,15-50,4-12 * * 3-12 3 *',
    // pattern: '3,6 10 * * * 0',
    ts: new Date(2018, 7, 22, 10, 23, 16),
  });

  const resolver = croner.resolver;
  const result = resolver.next();
  const nextResult = resolver.next();
  const nextResult2 = resolver.next();
});
