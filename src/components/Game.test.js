import React from 'react';
import { shallow } from 'enzyme';
import { Question } from './Game';

describe('Question', () => {
  const defaultOnKeyPress = jest.fn();
  const defaultOnChange = jest.fn();

  const createQuestion = (props) => {
    const defaultProps = {
      firstNum: 1,
      secondNum: 2,
      givenAnswer: 3,
      onKeyPress: defaultOnKeyPress,
      onChange: defaultOnChange,
    };

    const mergedProps = Object.assign({}, defaultProps, props);

    const {
      firstNum,
      secondNum,
      givenAnswer,
      onKeyPress,
      onChange,
    } = mergedProps;

    return shallow(
      <Question
        firstNum={firstNum}
        secondNum={secondNum}
        givenAnswer={givenAnswer}
        onKeyPress={onKeyPress}
        onChange={onChange}
      />
    );
  };
  it('renders first and second num', () => {
    const component = createQuestion();
    expect(component.find('.Question__number')).to.have.length(2);
  });

  it('renders input', () => {
    const component = createQuestion();
    expect(component.find('.Question__number--answer')).to.have.length(1);
  });

  it('renders firstNum prop', () => {
    const firstNum = 12;
    const component = createQuestion({ firstNum });
    expect(
      component
        .find('.Question__number')
        .first()
        .text()
    ).to.equal(`${firstNum}`);
  });

  it('renders secondNum prop', () => {
    const secondNum = 12;
    const component = createQuestion({ secondNum });
    expect(
      component
        .find('.Question__number')
        .last()
        .text()
    ).to.equal(`${secondNum}`);
  });

  it('renders givenAnswer prop', () => {
    const givenAnswer = 14;
    const component = createQuestion({ givenAnswer });
    const input = component.find('input').props();
    expect(input.value).to.equal(givenAnswer);
  });
  //

  it('triggers change on the input', () => {
    const newAnswer = 20;
    const component = createQuestion();
    component.find('input').simulate('change', newAnswer);
    expect(defaultOnChange).toBeCalledWith(newAnswer);
  });

  it('triggers keypress on the input', () => {
    const keyPress = {
      key: 'Enter',
    };
    const component = createQuestion();
    component.find('input').simulate('keypress', keyPress);
    expect(defaultOnKeyPress).toBeCalledWith(keyPress);
  });
});
