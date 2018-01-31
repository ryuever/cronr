import Token from '../src/Token';
import { LITERAL, RANGE, EVERY } from '../src/types';

test('test formatToParts', () => {
  const secondToken = Token.create('2,4-9,3-7', 'second');
  const parts = secondToken.formatToParts();

  expect(parts).toEqual([
    { type: LITERAL, value: 2 },
    { type: RANGE,
      value: {
        from: 4,
        to: 9,
    }},
    { type: RANGE,
      value: {
        from: 3,
        to: 7,
    }}
  ]);
})
