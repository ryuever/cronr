import React from 'react';
import { storiesOf } from '@storybook/react';
import Template from './components/Template';

storiesOf('Cronr', module)
  .add('Trigger on 10 milliseconds', () => {
    return <Template pattern="*/10 * * * * * *" />;
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
