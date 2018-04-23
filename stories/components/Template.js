import React, { Component } from 'react';
import Cronr from '../../lib/Cronr.cjs.js';
import './style.css';

const format = date => date.toLocaleString('en-US');
const toNum = date => date.valueOf();

export default class Template extends Component {
  constructor(props) {
    super(props);

    const { pattern } = props;
    this.state = {
      count: 0,
    };

    this.job = new Cronr(pattern, () => {
      const { count } = this.state;
      this.setState({
        count: count + 1,
      });
    });

    this.state.status = this.job.status;
  }

  handleStart() {
    try {
      this.job.start();
      this.setState({
        status: this.job.status,
      });
    } catch (err) {
      console.error(err.message);
    }
  }

  handleStop() {
    try {
      this.job.stop();
      this.setState({
        status: this.job.status,
      });
    } catch (err) {
      console.error(err.message);
    }
  }

  handleClear() {
    try {
      this.job.clear();
      this.setState({
        status: this.job.status,
      });
    } catch (err) {
      console.error(err.message);
    }
  }

  handleResume() {
    try {
      this.job.resume();
      this.setState({
        status: this.job.status,
      });
    } catch (err) {
      console.error(err.message);
    }
  }

  handleRestart() {
    try {
      this.job.restart();
      this.setState({
        status: this.job.status,
      });
    } catch (err) {
      console.error(err.message);
    }
  }

  render() {
    const { count, status } = this.state;

    const now = new Date();
    const nextTick = this.job.nextTick;
    const executeLog = `Executed : ${format(now)} - ${toNum(now)}`;
    const triggerLog = nextTick
      ? `Triggered: ${format(nextTick)} - ${toNum(nextTick)}`
      : '';
    count && console.log(executeLog, triggerLog);

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
        </section>

        <div className="count-value">Counter value : {count}</div>
      </div>
    );
  }
}
