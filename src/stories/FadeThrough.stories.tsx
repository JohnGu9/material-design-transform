import { ComponentMeta, ComponentStory } from '@storybook/react';
import { useState } from 'react';
import { FadeThrough } from '../lib';
import "../App.css";

export default {
  component: FadeThrough,
} as ComponentMeta<typeof FadeThrough>;

function buildFadeThrough(): ComponentStory<typeof FadeThrough> {
  return (args) => {
    const [id, setId] = useState(0);
    return (
      <div className='App'>
        <span className='Center'>
          <button onClick={() => setId(value => value + 1)}>change</button>
        </span>
        <FadeThrough keyId={id} {...args}>{id}</FadeThrough>
      </div>);
  };
}

export const Primary = buildFadeThrough().bind({});
