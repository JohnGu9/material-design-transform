import { ComponentMeta, ComponentStory } from '@storybook/react';
import { useState } from 'react';

import { ContainerTransform, ContainerTransformLayout } from '../lib/container-transform';

export default {
  component: ContainerTransform,
} as ComponentMeta<typeof ContainerTransform>;

const Template: ComponentStory<typeof ContainerTransform> = (args) => {
  const [id, setId] = useState(1 as number | undefined);
  return (
    <div style={{ padding: '0 32px' }}>
      <div style={{ margin: '32px 0', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <button onClick={() => setId(undefined)}>close</button>
        <button onClick={() => setId(0)}>open-0</button>
        <button onClick={() => setId(1)}>open-1</button>
        <button onClick={() => setId(2)}>open-2</button>
      </div>
      <ContainerTransformLayout keyId={id} style={{ outline: 'dotted', padding: 32, margin: 16, }}>
        <ContainerTransform
          container={<div style={fullSizeCenter}>Container0</div>}
          style={{ backgroundColor: 'white', outline: '1px solid black', }}
          {...args}
          keyId={0}>
          <div style={{ padding: 32, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            ContainerTransform0
          </div>
        </ContainerTransform>
        <div style={{ height: 32 }} />
        <ContainerTransform
          container={<div style={fullSizeCenter}>Container1</div>}
          style={{ backgroundColor: 'white', outline: 'dotted', }}
          {...args}
          keyId={1}>
          <div style={{ padding: 32, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            ContainerTransform1
          </div>
        </ContainerTransform>
        <div style={{ height: 32 }} />
        <ContainerTransform
          container={<div style={fullSizeCenter}>Container2</div>}
          style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12)'
          }}
          {...args}
          keyId={2}>
          <div style={{ margin: 16, padding: 32, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            ContainerTransform2
          </div>
        </ContainerTransform>
      </ContainerTransformLayout>
    </div>
  );
}

export const Primary = Template.bind({});

const fullSizeCenter = {
  backgroundColor: 'white',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  height: '100%', width: '100%',
}
