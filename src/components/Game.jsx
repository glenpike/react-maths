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
    const { time, numAnswered, numQuestions } = this.props;
    return (
      <div className="Score">
        <span className="Score__time">{msToMinsAndSecsStr(time)}</span>
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
    const { time, answers } = this.props;
    const numCorrect = answers.reduce((total, a) => {
      if (a.givenAnswer === a.actual) {
        total += 1;
      }
      return total;
    }, 0);
    return (
      <div className="LastGameScore">
        Well done! You got{' '}
        <span className="LastGameScore__value">
          {numCorrect} out of {answers.length} right
        </span>
        <br/>in <span className="LastGameScore__time">{msToMinsAndSecsStr(time)}</span>!
      </div>
    );
  }
}

export class HighScores extends Component {
  render() {
    const { fastestTimes } = this.props;
    const times = fastestTimes.map((time, idx) => (
      <li className="HighScore-item" key={idx}>
        {idx + 1}: {msToMinsAndSecsStr(time)}
      </li>
    ));
    return (
      <div>
        <p className="HighScore__title">Fastest Times</p>
        <ul className="HighScore">{times}</ul>
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

const msToMinsAndSecs = (time) => {
  const mins = Math.floor(time / (60 * 1000));
  const secs = Math.floor((time - mins * 60 * 1000) / 1000);
  return { mins, secs };
};

const msToMinsAndSecsStr = (time) => {
  const { mins, secs } = msToMinsAndSecs(time);
  return `${mins} minutes ${secs} seconds`;
};

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

const MAX_HIGH_SCORES = 5;

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
      stats: {},
      fastestTimes: [],
      newFastestTime: false,
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

    try {
      this.state.stats = JSON.parse(localStorage.getItem('stats')) || {};
    } catch (e) {
      console.log("Couldn't load stats data ", e);
    }

    try {
      this.state.fastestTimes =
        JSON.parse(localStorage.getItem('fastestTimes')) || [];
    } catch (e) {
      console.log("Couldn't load fastestTimes data ", e);
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
      answers: [],
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
        givenAnswer: '', // TODO - find better way to fix rendering empty input?
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
      const { firstNum, secondNum, answers } = this.state;
      let { questions } = this.state;
      const actual = firstNum * secondNum;

      const answer = {
        firstNum: this.state.firstNum,
        secondNum: this.state.secondNum,
        givenAnswer,
        actual,
      };
      answers.push(answer);
      this.setState({ answers });
      if (questions.length) {
        this.nextQuestion(questions);
      } else {
        this.finishGame();
      }
    }
  };

  checkScores = () => {
    const { answers, stats } = this.state;

    // Add to stats whilst checking if all correct.
    let allCorrect = true;
    answers.forEach(({ firstNum, secondNum, givenAnswer, actual }) => {
      if (!stats[secondNum]) {
        stats[secondNum] = {};
      }
      const stat = stats[secondNum][firstNum] || { correct: 0, wrong: 0 };
      if (givenAnswer === actual) {
        stat.correct += 1;
      } else {
        stat.wrong += 1;
        allCorrect = false;
      }
      stats[secondNum][firstNum] = stat;
    });

    try {
      localStorage.setItem('stats', JSON.stringify(stats));
    } catch (e) {
      console.log("Couldn't save stats data ", e);
    }

    if (allCorrect) {
      this.updateFastestTimes();
    }

    this.setState({
      stats,
    });
  };

  // TODO: seem to have an issue with >5 times!
  updateFastestTimes = () => {
    const { fastestTimes, timer: { lastUpdate } } = this.state;
    let updatedFastestTimes = fastestTimes.slice(0);
    let newFastestTime = false;
    for (let i = 0; i < updatedFastestTimes.length; i++) {
      if (lastUpdate < updatedFastestTimes[i]) {
        updatedFastestTimes.splice(i, 0, lastUpdate);
        updatedFastestTimes = updatedFastestTimes.slice(0, MAX_HIGH_SCORES);
        newFastestTime = true;
        break;
      }
    }
    if (
      updatedFastestTimes.length === fastestTimes.length &&
      updatedFastestTimes.length < MAX_HIGH_SCORES
    ) {
      updatedFastestTimes.push(lastUpdate);
      newFastestTime = true;
    }

    try {
      localStorage.setItem('fastestTimes', JSON.stringify(updatedFastestTimes));
    } catch (e) {
      console.log("Couldn't save fastestTimes data ", e);
    }

    this.setState({
      newFastestTime,
      fastestTimes: updatedFastestTimes,
    });
  };

  finishGame = () => {
    const gameState = GameStates.STATE_FINISHED;
    const { timer } = this.state;

    // stop clock.
    if (timer.interval) {
      clearInterval(timer.interval);
    }
    timer.interval = null;
    this.checkScores();

    this.setState({
      gameState,
      timer,
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
      timer: { lastUpdate },
      numQuestions,
      gameState,
      fastestTimes,
    } = this.state;
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
          {gameState === GameStates.STATE_INITIAL && (
            <div>
              <HighScores fastestTimes={fastestTimes} />
            </div>
          )}
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
              time={lastUpdate}
              numAnswered={answers.length}
              numQuestions={numQuestions}
            />
          )}
          {gameState === GameStates.STATE_FINISHED && (
            <div>
              <LastGameScore answers={answers} time={lastUpdate} />
              <HighScores fastestTimes={fastestTimes} />
            </div>
          )}
        </div>
        <div className="col-3">
          <Answers answers={answers} />
        </div>
      </div>
    );
  }
}
