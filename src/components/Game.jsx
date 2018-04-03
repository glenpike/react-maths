import React, { Component } from 'react';
import levelData from '../data/levels';

export class Question extends Component {
  render() {
    const {
      firstNum,
      secondNum,
      givenAnswer,
      onKeyPress,
      onChange,
    } = this.props;
    return (
      <div className="Question">
        <span className="Question__number">{firstNum}</span>
        &nbsp;x&nbsp;
        <span className="Question__number">{secondNum}</span>
        &nbsp;=&nbsp;
        <input
          className="Question__number--answer text-input"
          type="number"
          value={givenAnswer}
          onKeyPress={onKeyPress}
          onChange={onChange}
        />
      </div>
    );
  }
}

export class Score extends Component {
  render() {
    const { mins, secs, numAnswered, numQuestions } = this.props;
    const time = `${mins} minutes ${secs} seconds`;
    return (
      <div className="Score">
        <span className="Score__time">{time}</span>
        <br />
        <span className="Score__value">
          {numAnswered} of {numQuestions} answered
        </span>
      </div>
    );
  }
}

export class Settings extends Component {
  onSubmit = (event) => {
    event.preventDefault();
    const settings = {};
    for (const ref in this.refs) {
      settings[ref] = this.refs[ref].checked;
    }
    const { onSubmit } = this.props;
    onSubmit(settings);
  };

  render() {
    const { levels, runTimer } = this.props;
    const levelItems = Object.keys(levels).map((level, idx) => (
      <li className="Settings__levels-item checkbox primary" key={level}>
        <input
          ref={level}
          id={level}
          className="checkbox"
          type="checkbox"
          defaultChecked={levels[level]}
        />
        <label htmlFor={level}>{level}</label>
      </li>
    ));
    return (
      <div className="Settings">
        <form onSubmit={this.onSubmit}>
          <ul className="Settings__levels">{levelItems}</ul>
          <ul className="Settings__extra">
            <li className="Settings__extra-item checkbox primary">
              <input
                className="checkbox"
                type="checkbox"
                ref="runTimer"
                id="runTimer"
                defaultChecked={runTimer}
              />
              <label htmlFor="runTimer">Timer</label>
            </li>
            <li className="Settings__extra-item checkbox primary">
              <input className="button" type="submit" value="Go!" />
            </li>
          </ul>
        </form>
      </div>
    );
  }
}

export class Answers extends Component {
  render() {
    const { answers } = this.props;
    const answerItems = answers.map((answer, idx) => (
      <li
        className={
          'Answers__list-item ' +
          (answer.givenAnswer === answer.actual ? 'correct' : 'wrong')
        }
        key={idx}
      >
        {answer.firstNum} x {answer.secondNum} = {answer.givenAnswer}
        <span className="Answers__answer">
          {answer.givenAnswer === answer.actual
            ? ''
            : 'Correct answer: ' + answer.actual}
        </span>
      </li>
    ));
    return (
      <div className="Answers">
        <ul className="Answers__list">{answerItems}</ul>
      </div>
    );
  }
}

const shuffle = (array) => {
  let counter = array.length;
  const result = array.slice(0);
  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);
    // Decrease counter by 1
    counter--;
    // And swap the last element with it
    [result[counter], result[index]] = [result[index], result[counter]];
  }

  return result;
};

export default class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstNum: '',
      secondNum: '',
      givenAnswer: '',
      levels: {},
      playing: false,
      runTimer: false,
      answers: [],
      numQuestions: 10,
      questions: [],
      timer: {
        finished: false,
        resolution: 100,
        interval: null,
        allowed: 2 * 60 * 1000,
        left: '',
      },
    };

    Object.keys(levelData).forEach((level, idx) => {
      this.state.levels[level] = idx < 5 ? true : false;
    });
  }

  onStartGame = (settings) => {
    // create available questions.
    let availableQuestions = [];
    const { levels, timer } = this.state;
    const { allowed, interval, resolution } = timer;
    Object.keys(levels).forEach((level) => {
      if (settings[level]) {
        availableQuestions = availableQuestions.concat(levelData[level]);
      }
    });
    availableQuestions = shuffle(availableQuestions);
    // create n questions randomly from our available.
    let questions = availableQuestions.slice(0, this.state.numQuestions);
    questions = this.nextQuestion(questions);

    if (interval) {
      clearInterval(interval);
    }
    // start the timer.
    timer.interval = setInterval(() => {
      this.onTimerUpdate();
    }, resolution);
    timer.left = allowed;
    timer.finished = false;
    this.setState({
      playing: true,
      timer,
      questions,
    });
  };

  onTimerUpdate = () => {
    // update the clock...
    const { timer } = this.state;
    const { left, resolution } = timer;
    timer.left = left - resolution;
    if (timer.left <= 0) {
      this.finished();
    } else {
      this.setState({ timer });
    }
  };

  finished = () => {
    // stop the timer.
    const { timer } = this.state;
    clearInterval(timer.interval);
    timer.interval = null;
    // show 'finished!'
    this.setState({
      playing: false,
      timer,
    });
    // clear values?
  };

  nextQuestion = (questions) => {
    if (questions.length) {
      const [firstNum, secondNum] = questions.shift();
      this.setState({
        firstNum,
        secondNum,
        givenAnswer: '',
      });
    } else {
      this.finished();
    }
    return questions;
  };

  onKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const givenAnswer = +event.target.value;
      console.log(`enter key: ${givenAnswer}`);
      const { firstNum, secondNum, answers } = this.state;
      let { questions } = this.state;
      const actual = firstNum * secondNum;

      const answer = {
        firstNum: this.state.firstNum,
        secondNum: this.state.secondNum,
        givenAnswer,
        actual,
      };
      console.log('answer given ', answer);
      answers.push(answer);
      questions = this.nextQuestion(questions);
      this.setState({ questions, answers });
    }
  };

  onChange = (event) => {
    const givenAnswer = +event.target.value;
    this.setState({
      givenAnswer,
    });
  };

  render() {
    const {
      firstNum,
      secondNum,
      givenAnswer,
      levels,
      runTimer,
      answers,
      timer,
      numQuestions,
    } = this.state;
    const { left } = timer;
    const mins = Math.floor(left / (60 * 1000));
    const secs = Math.floor((left - mins * 60 * 1000) / 1000);
    return (
      <div className="Game grid-container">
        <div className="col-1">
          <Settings
            levels={levels}
            runTimer={runTimer}
            onSubmit={this.onStartGame}
          />
        </div>
        <div className="col-2">
          <Question
            firstNum={firstNum}
            secondNum={secondNum}
            givenAnswer={givenAnswer}
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
          />
          <Score
            mins={mins}
            secs={secs}
            numAnswered={answers.length}
            numQuestions={numQuestions}
          />
        </div>
        <div className="col-3">
          <Answers answers={answers} />
        </div>
      </div>
    );
  }
}
