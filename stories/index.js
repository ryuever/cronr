import React from 'react';
import { storiesOf } from '@storybook/react';
import Template from './components/Template';
import WithWorkersTemplate from './components/WithWorkersTemplate';

storiesOf('Cronr', module)
  .add('Trigger on every 50 milliseconds', () => {
    return <Template pattern="*/50 * * * * * *" />;
  })
  .add('Trigger on every second', () => {
    return <Template pattern="*/1 * * * * *" />;
  })
  .add('Trigger on 2,5 second', () => {
    return <Template pattern="2,5 * * * * *" />;
  })
  .add('Trigger on 7,8,9,10 second', () => {
    return <Template pattern="7-10 * * * * *" />;
  });

storiesOf('with webWorkers', module)
  .add('Trigger on every 50 milliseconds', () => {
    return <WithWorkersTemplate pattern="*/50 * * * * * *" />;
  })
  .add('Trigger on every second', () => {
    return <WithWorkersTemplate pattern="*/1 * * * * *" />;
  })
  .add('Trigger on 2,5 second', () => {
    return <WithWorkersTemplate pattern="2,5 * * * * *" />;
  })
  .add('Trigger on 7,8,9,10 second', () => {
    return <WithWorkersTemplate pattern="7-10 * * * * *" />;
  });
