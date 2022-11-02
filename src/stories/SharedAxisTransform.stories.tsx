import { ComponentMeta, ComponentStory } from '@storybook/react';
import { SharedAxis } from '../lib';

export default {
    component: SharedAxis,
} as ComponentMeta<typeof SharedAxis>;

const Template: ComponentStory<typeof SharedAxis> = (args) =>
    <SharedAxis  {...args} />;

export const Primary = Template.bind({});
Primary.args = {
    keyId: 'aa'
};
