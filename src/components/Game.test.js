import React from 'react';
import { render } from 'enzyme';
import { expect } from 'chai';
import { Question } from './Game';

it('renders first and second num', () => {
  const component = render(<Question />);
  expect(component.find('.Question__number')).to.have.length(2);
});

it('renders firstNum prop', () => {
  const firstNum = 12;
  const component = render(<Question firstNum={firstNum} />);
  expect(
    component
      .find('.Question__number')
      .first()
      .text()
  ).to.equal(`${firstNum}`);
});

it('renders secondNum prop', () => {
  const secondNum = 12;
  const component = render(<Question secondNum={secondNum} />);
  expect(
    component
      .find('.Question__number')
      .last()
      .text()
  ).to.equal(`${secondNum}`);
});
