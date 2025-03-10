import { action } from '@storybook/addon-actions';
import { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';
import { elevationBoxShadow } from '../lib/common';
import { ContainerTransform, ContainerTransformLayout, ContainerFit, Fit } from '../lib/container-transform';
import "./ContainerTransform.css";

export default {
  component: ContainerTransform,
} as Meta<typeof ContainerTransform>;

const testText = `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.`;
const container =
  <div style={{ overflow: 'scroll', height: '100%', width: '100%' }}>
    <div style={{ padding: 16 }}>{testText}</div>
  </div>;

const Template: StoryFn<typeof ContainerTransform> = (args) => {
  const [id, setId] = useState(1 as number | undefined);
  return (
    <div className="main">
      <div className="buttons-bar">
        <button onClick={() => setId(undefined)}>close</button>
        <button onClick={() => setId(0)}>open-0</button>
        <button onClick={() => setId(1)}>open-1</button>
        <button onClick={() => setId(2)}>open-2</button>
      </div>
      <ContainerTransformLayout
        keyId={id}
        className="container-transform-layout"
        onScrimClick={action('onScrimClick')}>
        <ContainerTransform
          container={<div className='full-size'>Container0</div>}
          style={{ backgroundColor: 'white', outline: '1px solid black' }}
          {...args}
          keyId={0}>
          <div className="container">
            ContainerTransform0
          </div>
        </ContainerTransform>
        <div style={{ height: 32 }} />
        <ContainerTransform
          container={<div className='full-size'>Container1</div>}
          style={{ backgroundColor: 'white', outline: 'dotted' }}
          {...args}
          keyId={1}>
          <div className="container">
            ContainerTransform1
          </div>
        </ContainerTransform>
        <div style={{ height: 32 }} />
        <ContainerTransform
          container={<div className='full-size'>Container2</div>}
          style={{
            backgroundColor: 'yellow',
            borderRadius: '10px',
            boxShadow: elevationBoxShadow(4),
          }}
          {...args}
          keyId={2}>
          <div className="container">
            ContainerTransform2
          </div>
        </ContainerTransform>
      </ContainerTransformLayout>
    </div>
  );
}

export const Primary = Template.bind({});

const Template0: StoryFn<typeof ContainerTransform> = (args) => {
  const [id, setId] = useState(0 as number | undefined);
  return (
    <div className="main">
      <div className="buttons-bar">
        <button onClick={() => setId(id === undefined ? 0 : undefined)}>{id === undefined ? 'open' : 'close'}</button>
      </div>
      <ContainerTransformLayout
        keyId={id}
        className="container-transform-layout"
        onScrimClick={action('onScrimClick')}
        overlayPosition={{
          centerX: 0.6,
          centerY: 0.7,
          width: 0.8,
          height: 0.7,
        }}>
        <ContainerTransform
          container={container}
          style={{
            backgroundColor: 'yellow',
            borderRadius: '10px',
            boxShadow: elevationBoxShadow(4),
          }}
          {...args}
          keyId={0}>
          <div className="container">
            ContainerTransform
          </div>
        </ContainerTransform>
      </ContainerTransformLayout>
    </div>
  );
}

export const OverlayPosition = Template0.bind({});

const Template1: StoryFn<typeof ContainerTransform> = (args) => {
  const [id, setId] = useState(0 as number | undefined);
  return (
    <div className="main">
      <div className="buttons-bar">
        <button onClick={() => setId(id === undefined ? 0 : undefined)}>{id === undefined ? 'open' : 'close'}</button>
      </div>
      <ContainerTransformLayout
        keyId={id}
        className="container-transform-layout"
        onScrimClick={action('onScrimClick')}>
        <ContainerTransform
          mock="Mock"
          container={container}
          style={{
            backgroundColor: 'white',
            boxShadow: elevationBoxShadow(4),
          }}
          {...args}
          keyId={0}>
          <div className="container">
            ContainerTransform
          </div>
        </ContainerTransform>
      </ContainerTransformLayout>
    </div>
  );
}

export const Mock = Template1.bind({});

const Template2: StoryFn<typeof ContainerTransform> = (args) => {
  const [id, setId] = useState(0 as number | undefined);
  return (
    <div className="main">
      <div className="buttons-bar">
        <button onClick={() => setId(undefined)}>close</button>
        <button onClick={() => setId(0)}>open-0</button>
        <button onClick={() => setId(1)}>open-1</button>
      </div>
      <ContainerTransformLayout
        keyId={id}
        className="container-transform-layout"
        onScrimClick={action('onScrimClick')}
        container={container}>
        <ContainerTransform
          containerFit={ContainerFit.width}
          style={{ backgroundColor: 'white', outline: '1px solid black' }}
          {...args}
          keyId={0}>
          <div className="container">
            ContainerFit.width
          </div>
        </ContainerTransform>
        <div style={{ height: 32 }} />
        <ContainerTransform
          containerFit={ContainerFit.both}
          style={{ backgroundColor: 'white', outline: 'dotted' }}
          {...args}
          keyId={1}>
          <div className="container">
            ContainerFit.both
          </div>
        </ContainerTransform>
      </ContainerTransformLayout>
    </div>
  );
}

export const containerFit = Template2.bind({});

const Template3: StoryFn<typeof ContainerTransform> = (args) => {
  const [id, setId] = useState(0 as number | undefined);
  return (
    <div className="main">
      <div className="buttons-bar">
        <button onClick={() => setId(undefined)}>close</button>
        <button onClick={() => setId(0)}>open-0</button>
        <button onClick={() => setId(1)}>open-1</button>
        <button onClick={() => setId(2)}>open-2</button>
        <button onClick={() => setId(3)}>open-3</button>
      </div>
      <ContainerTransformLayout
        keyId={id}
        className="container-transform-layout"
        onScrimClick={action('onScrimClick')}
        container={container}>
        <ContainerTransform
          fit={Fit.originSize}
          style={{ backgroundColor: 'white', outline: '1px solid black' }}
          {...args}
          keyId={0}>
          <div className="container">
            Fit.originSize
          </div>
        </ContainerTransform>
        <div style={{ height: 32 }} />
        <ContainerTransform
          fit={Fit.both}
          style={{ backgroundColor: 'white', outline: '1px solid black' }}
          {...args}
          keyId={1}>
          <div className="container">
            Fit.both
          </div>
        </ContainerTransform>
        <div style={{ height: 32 }} />
        <ContainerTransform
          fit={Fit.width}
          style={{ backgroundColor: 'white', outline: '1px solid black' }}
          {...args}
          keyId={2}>
          <div className="container">
            Fit.width
          </div>
        </ContainerTransform>
        <div style={{ height: 32 }} />
        <ContainerTransform
          fit={Fit.height}
          style={{ backgroundColor: 'white', outline: '1px solid black' }}
          {...args}
          keyId={3}>
          <div className="container">
            Fit.height
          </div>
        </ContainerTransform>
      </ContainerTransformLayout>
    </div>
  );
}

export const fit = Template3.bind({});
