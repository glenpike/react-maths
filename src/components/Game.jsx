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

// TODO: refactor these 2 into single or nested component?
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

export class LastGameScore extends Component {
  render() {
    return (
      <div className="Score">
        Congratulations, you got 9 out of 10 right! Your time was... (Only add
        to high-scores if all correct) Time + accuracy needs to account for
        score!
      </div>
    );
  }
}

export class Settings extends Component {
  onSubmit = (event) => {
    event.preventDefault();
    const settings = { levels: {} };
    for (const ref in this.refs) {
      if ('countDown' === ref) {
        settings[ref] = this.refs[ref].checked;
      } else {
        settings.levels[ref] = this.refs[ref].checked;
      }
    }
    const { onSubmit } = this.props;
    onSubmit(settings);
  };

  render() {
    const { levels } = this.props;
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
            <li className="Settings__extra-item">
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
    const answerItems = answers
      .slice(0)
      .reverse()
      .map((answer, idx) => (
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
              : 'Correct answer = ' + answer.actual}
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

const getTimesTable = (number) => {
  const table = [];
  for (let i = 1; i <= 12; i++) {
    table.push([i, number]);
  }
  return table;
};

const GameStates = {
  STATE_INITIAL: 'STATE_INITIAL',
  STATE_RUNNING: 'STATE_RUNNING',
  STATE_FINISHED: 'STATE_FINISHED',
};

export default class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstNum: '',
      secondNum: '',
      givenAnswer: '',
      levels: {},
      answers: [],
      numQuestions: 10,
      questions: [],
      gameState: GameStates.STATE_INITIAL,
      timer: {
        resolution: 100,
        interval: null,
        lastUpdate: '',
      },
    };

    let savedLevels;
    try {
      savedLevels = JSON.parse(localStorage.getItem('levels'));
    } catch (e) {
      savedLevels = [];
      console.log("Couldn't load level data ", e);
    }

    Object.keys(levelData).forEach((level, idx) => {
      let savedLevel = false;
      if (savedLevels && savedLevels[level]) {
        savedLevel = true;
      }
      this.state.levels[level] = savedLevel;
    });
  }

  onStartGame = (settings) => {
    let availableQuestions = [];
    const { levels } = settings;
    try {
      const levelsToSave = JSON.stringify(levels);
      localStorage.setItem('levels', levelsToSave);
    } catch (e) {
      console.log("Couldn't save level data ", e);
    }
    const { timer } = this.state;
    const { interval, resolution } = timer;
    Object.keys(levels).forEach((level) => {
      if (levels[level]) {
        availableQuestions = availableQuestions.concat(
          getTimesTable(levelData[level])
        );
      }
    });
    availableQuestions = shuffle(availableQuestions);
    // create n questions randomly from our available.
    let questions = availableQuestions.slice(0, this.state.numQuestions);
    this.nextQuestion(questions);

    if (interval) {
      clearInterval(interval);
    }
    // start the timer.
    timer.interval = setInterval(() => {
      this.onTimerUpdate();
    }, resolution);
    timer.lastUpdate = 0;
    const gameState = GameStates.STATE_RUNNING;
    this.setState({
      levels,
      gameState,
      timer,
    });
  };

  onTimerUpdate = () => {
    const { timer } = this.state;
    const { lastUpdate, resolution } = timer;
    timer.lastUpdate = lastUpdate + resolution;
    this.setState({ timer });
  };

  nextQuestion = (questions) => {
    if (questions.length) {
      const [firstNum, secondNum] = questions.shift();
      this.setState({
        questions,
        firstNum,
        secondNum,
        givenAnswer: '',
      });
    }
  };

  onKeyPress = (event) => {
    if (
      event.key === 'Enter' &&
      this.state.gameState === GameStates.STATE_RUNNING
    ) {
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
      this.setState({ answers });
      if (questions.length) {
        this.nextQuestion(questions);
      } else {
        this.finishGame();
      }
    }
  };

  finishGame = () => {
    // disable inputs / state.
    const gameState = GameStates.STATE_FINISHED;
    // stop clock.
    const { timer: { interval } } = this.state;
    if (interval) {
      clearInterval(interval);
    }
    // check if all correct - shows in final score.
    // check if time is faster than others.
    // save 'stats';
    this.setState({
      gameState,
    });
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
      countDown,
      answers,
      timer,
      numQuestions,
      gameState,
    } = this.state;
    const { lastUpdate } = timer;
    const mins = Math.floor(lastUpdate / (60 * 1000));
    const secs = Math.floor((lastUpdate - mins * 60 * 1000) / 1000);
    return (
      <div className="Game grid-container">
        <div className="col-1">
          <Settings
            levels={levels}
            countDown={countDown}
            onSubmit={this.onStartGame}
          />
        </div>
        <div className="col-2">
          {gameState === GameStates.STATE_RUNNING && (
            <Question
              firstNum={firstNum}
              secondNum={secondNum}
              givenAnswer={givenAnswer}
              onChange={this.onChange}
              onKeyPress={this.onKeyPress}
            />
          )}
          {gameState === GameStates.STATE_RUNNING && (
            <Score
              mins={mins}
              secs={secs}
              numAnswered={answers.length}
              numQuestions={numQuestions}
            />
          )}
          {gameState === GameStates.STATE_FINISHED && (
            <LastGameScore answers={answers} mins={mins} secs={secs} />
          )}
        </div>
        <div className="col-3">
          <Answers answers={answers} />
        </div>
      </div>
    );
  }
}
