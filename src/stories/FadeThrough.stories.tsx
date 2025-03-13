import { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';
import { FadeThrough } from '../lib';
import "../App.css";

export default {
  component: FadeThrough,
} as Meta<typeof FadeThrough>;

const Template: StoryFn<typeof FadeThrough> = (args) => {
  const [id, setId] = useState(0);
  return (
    <div className='App'>
      <span className='Center'>
        <button onClick={() => setId(id === 0 ? 1 : 0)}>change</button>
      </span>
      <FadeThrough keyId={id} {...args}>{id}</FadeThrough>
    </div>);
};

export const M2 = Template.bind({});

export const M3 = Template.bind({});
M3.args = {
  transitionStyle: "M3",
};
