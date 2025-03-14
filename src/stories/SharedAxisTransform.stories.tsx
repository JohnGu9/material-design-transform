import { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';
import { SharedAxis, SharedAxisTransform } from '../lib';
import "../App.css";

export default {
  component: SharedAxis,
} as Meta<typeof SharedAxis>;

function buildSharedAxis(...transforms: SharedAxisTransform[]): StoryFn<typeof SharedAxis> {
  return (args) => {
    const [id, setId] = useState(0);
    return (
      <div className='App'>
        <span className='Center'>
          <button onClick={() => setId(id === 0 ? 1 : 0)}>change</button>
        </span>
        {transforms.map(value =>
          <SharedAxis key={value} transform={value}
            keyId={id}
            {...args} >
            {id}
          </SharedAxis>)}
      </div>);
  };
}

export const XAxisM2 = buildSharedAxis(SharedAxisTransform.fromLeftToRight, SharedAxisTransform.fromRightToLeft).bind({});
export const YAxisM2 = buildSharedAxis(SharedAxisTransform.fromTopToBottom, SharedAxisTransform.fromBottomToTop).bind({});
export const ZAxisM2 = buildSharedAxis(SharedAxisTransform.fromFrontToBack, SharedAxisTransform.fromBackToFront).bind({});


function buildSharedAxisM3(...transforms: SharedAxisTransform[]): StoryFn<typeof SharedAxis> {
  return (args) => {
    const [id, setId] = useState(0);
    return (
      <div className='App'>
        <span className='Center'>
          <button onClick={() => setId(id === 0 ? 1 : 0)}>change</button>
        </span>
        {transforms.map(value =>
          <SharedAxis key={value} transform={value} transitionStyle='M3'
            keyId={id}
            {...args} >
            {id}
          </SharedAxis>)}
      </div>);
  };
}
export const XAxisM3 = buildSharedAxisM3(SharedAxisTransform.fromLeftToRight, SharedAxisTransform.fromRightToLeft).bind({});
export const YAxisM3 = buildSharedAxisM3(SharedAxisTransform.fromTopToBottom, SharedAxisTransform.fromBottomToTop).bind({});
export const ZAxisM3 = buildSharedAxisM3(SharedAxisTransform.fromFrontToBack, SharedAxisTransform.fromBackToFront).bind({});
