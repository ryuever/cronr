import Token from '../src/Token';
import { LITERAL, RANGE, EVERY } from '../src/tokenTypes';

test('test formatToParts', () => {
  const secondToken = Token.create('2,4-9,3-7', 'second');
  const parts = secondToken.formatToParts();

  expect(parts).toEqual([
    { type: LITERAL, value: 2 },
    { type: RANGE, value: { from: 4, to: 9 } },
    { type: RANGE, value: { from: 3, to: 7 } },
  ]);
});

test('Find the closest valid valud', () => {
  const secondToken = Token.create('2,4-9,3-7', 'second');
  const value = secondToken.findTheClosestValidValue(1, new Date());
  expect(value).toBe(2);
});

test('Find the closest valid valud, itself should also be included', () => {
  const secondToken = Token.create('2,4-9,3-7', 'second');
  const value = secondToken.findTheClosestValidValue(3, new Date());
  expect(value).toBe(3);
});

test('Outof match boundary', () => {
  const secondToken = Token.create('2,4-9,3-7', 'second');
  expect(() => {
    secondToken.findTheClosestValidValue(30, new Date());
  }).toThrowError('Maybe you should carry over the number, then match again');
});

test('Find the closest valid valud with step restriction', () => {
  const secondToken = Token.create('*/5', 'second');
  const value = secondToken.findTheClosestValidValue(1, new Date());
  expect(value).toBe(5);
});

test('Find the closest valid valud with step restriction, itself should also be included', () => {
  const secondToken = Token.create('*/5', 'second');
  const value = secondToken.findTheClosestValidValue(5, new Date());
  expect(value).toBe(5);
});

test('Outof match boundary with step restriction', () => {
  const secondToken = Token.create('*/5', 'second');
  expect(() => {
    secondToken.findTheClosestValidValue(56, new Date());
  }).toThrowError('Maybe you should carry over the number, then match again');
});

// "1-9/2" is the same	as "1,3,5,7,9".
test('Find the closest valid valud with range restriction', () => {
  const secondToken = Token.create('1-9/2', 'second');
  const value = secondToken.findTheClosestValidValue(1, new Date());
  expect(value).toBe(1);
});
test('Find the closest valid valud with range restriction, itself should also be included', () => {
  const secondToken = Token.create('1-9/2', 'second');
  const value = secondToken.findTheClosestValidValue(6, new Date());
  expect(value).toBe(7);
});
test('Outof match boundary with range restriction', () => {
  const secondToken = Token.create('1-9/2', 'second');
  expect(() => {
    secondToken.findTheClosestValidValue(10, new Date());
  }).toThrowError('Maybe you should carry over the number, then match again');
});
