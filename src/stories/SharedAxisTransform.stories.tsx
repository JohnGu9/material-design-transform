import { ComponentMeta, ComponentStory } from '@storybook/react';
import { useState } from 'react';
import { SharedAxis, SharedAxisTransform } from '../lib';
import "../App.css";

export default {
  component: SharedAxis,
} as ComponentMeta<typeof SharedAxis>;

function buildSharedAxis(...transforms: SharedAxisTransform[]): ComponentStory<typeof SharedAxis> {
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

export const XAxis = buildSharedAxis(SharedAxisTransform.fromLeftToRight, SharedAxisTransform.fromRightToLeft).bind({});
export const YAxis = buildSharedAxis(SharedAxisTransform.fromTopToBottom, SharedAxisTransform.fromBottomToTop).bind({});
export const ZAxis = buildSharedAxis(SharedAxisTransform.fromFrontToBack, SharedAxisTransform.fromBackToFront).bind({});
