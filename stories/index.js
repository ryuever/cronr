import React from 'react';
import { storiesOf } from '@storybook/react';
import Template from './components/Template';
import WithWorkersTemplate from './components/WithWorkersTemplate';

storiesOf('Cronr', module)
  .add('Trigger on every 50 milliseconds', () => {
    return <Template pattern="*/50 * * * * * *" />;
  }, {
    notes: `
      <b>Open Dev tools to check log detail</b>
<pre>
import CronrWorker from 'cronr'

const job = new Cronr("*/50 * * * * * *", () => {
    const { count } = this.state;
  this.setState({
    count: count + 1,
  });
});
</pre>
    `
  })
  .add('Trigger on every second', () => {
    return <Template pattern="*/1 * * * * *" />;
  }, {
    notes: `
      <b>Open Dev tools to check log detail</b>
<pre>
import CronrWorker from 'cronr'

const job = new Cronr("*/1 * * * * *", () => {
    const { count } = this.state;
  this.setState({
    count: count + 1,
  });
});
</pre>
    `
  })
  .add('Trigger on 2,5 second', () => {
    return <Template pattern="2,5 * * * * *" />;
  }, {
    notes: `
      <b>Open Dev tools to check log detail</b>
<pre>
import CronrWorker from 'cronr'

const job = new Cronr("2,5 * * * * *", () => {
    const { count } = this.state;
  this.setState({
    count: count + 1,
  });
});
</pre>
    `
  })
  .add('Trigger on 7,8,9,10 second', () => {
    return <Template pattern="7-10 * * * * *" />;
  }, {
    notes: `
    <b>Open Dev tools to check log detail</b>
<pre>
import CronrWorker from 'cronr'

const job = new Cronr("7-10 * * * * *", () => {
  const { count } = this.state;
this.setState({
  count: count + 1,
});
});
</pre>
  `
  });

storiesOf('with webWorkers', module)
  .add('Trigger on every 50 milliseconds', () => {
    return <WithWorkersTemplate pattern="*/50 * * * * * *" />;
  }, {
    notes:`
    <b>Open Dev tools to check log detail</b>
<pre>
import CronrWorker from 'cronr/CronrWorker'

const worker = CronrWorker("*/50 * * * * * *");
worker.onmessage = (e) => {
  if (action === 'trigger') {
    // ...
  }
};
</pre>
`
  })
  .add('Trigger on every second', () => {
    return <WithWorkersTemplate pattern="*/1 * * * * *" />;
  }, {
    notes:`
    <b>Open Dev tools to check log detail</b>
<pre>
import CronrWorker from 'cronr/CronrWorker'

const worker = CronrWorker("*/1 * * * * *");
worker.onmessage = (e) => {
  if (action === 'trigger') {
    // ...
  }
};
</pre>
`
  })
  .add('Trigger on 2,5 second', () => {
    return <WithWorkersTemplate pattern="2,5 * * * * *" />;
  }, {
    notes:`
    <b>Open Dev tools to check log detail</b>
<pre>
import CronrWorker from 'cronr/CronrWorker'

const worker = CronrWorker("2,5 * * * * *");
worker.onmessage = (e) => {
  if (action === 'trigger') {
    // ...
  }
};
</pre>
`
  })
  .add('Trigger on 7,8,9,10 second', () => {
    return <WithWorkersTemplate pattern="7-10 * * * * *" />;
  }, {
    notes:`
    <b>Open Dev tools to check log detail</b>
<pre>
import CronrWorker from 'cronr/CronrWorker'

const worker = CronrWorker("7-10 * * * * *");
worker.onmessage = (e) => {
  if (action === 'trigger') {
    // ...
  }
};
</pre>
`
  });
