import React, { Component } from 'react';
import CronrWorker from '../../CronrWorker';
import './style.css';

const format = date => date.toLocaleString('en-US');
const toNum = date => date.valueOf();

export default class WithWorkersTemplate extends Component {
  constructor(props) {
    super(props);

    const { pattern } = props;
    this.state = {
      count: 0,
      status: 'initial',
    };

    this.store = new Map();

    this.worker = CronrWorker(pattern);
    this.worker.onmessage = (e) => {
      const data = e.data;
      const { nextTick, triggerAt, hit, status, action } = data;

      if (action === 'trigger') {
        this.store.set(hit, {
          triggerAt,
          nextTick,
        });
        this.setState({
          count: this.state.count + 1,
          status,
        });
      }

      if (action === 'updateStatus') {
        this.setState({
          status,
        });
      }

    };

    this.worker.onerror = (e) => {
      const { message } = e;
      console.log(e.message);
    };
  }

  componentWillUnmount() {
    this.worker.postMessage({
      action: 'terminate',
    });
  }

  handleStart() {
    this.worker.postMessage({
      action: 'start',
    });
  }

  handleStop() {
    this.worker.postMessage({
      action: 'stop',
    });
  }

  handleClear() {
    this.worker.postMessage({
      action: 'clear',
    });
  }

  handleResume() {
    this.worker.postMessage({
      action: 'resume',
    });
  }

  handleRestart() {
    this.worker.postMessage({
      action: 'restart',
    });
  }

  handleTerminate() {
    this.worker.postMessage({
      action: 'terminate',
    });
  }

  render() {
    const { count, status } = this.state;
    const now = new Date();

    const executeLog = `${count} -- Executed : ${format(now)} - ${toNum(now)}`;
    let triggerLog = '';
    let nextTickLog = '';
    if (this.store.has(count)) {
      const { triggerAt, nextTick } = this.store.get(count);
      triggerLog = `Should Triggered at: ${toNum(triggerAt)}`;
      nextTickLog = `nextTick: ${toNum(nextTick)}`;
    }

    console.log(executeLog, triggerLog, nextTickLog);

    return (
      <div>
        <section className="action-groups">
          <button
            onClick={this.handleStart.bind(this)}
            className={
              status === 'initial' || status === 'running' ? 'active' : ''
            }
          >
            start
          </button>

          <button
            onClick={this.handleStop.bind(this)}
            className={status === 'suspend' ? 'active' : ''}
          >
            stop
          </button>

          <button
            onClick={this.handleClear.bind(this)}
            className={status === 'clear' ? 'active' : ''}
          >
            clear
          </button>

          <button onClick={this.handleResume.bind(this)}>resume</button>

          <button onClick={this.handleRestart.bind(this)}>restart</button>

          <button
            onClick={this.handleTerminate.bind(this)}
            className="terminate"
          >
            terminate
          </button>
        </section>

        <div className="count-value">Counter value : {count}</div>
      </div>
    );
  }
}
