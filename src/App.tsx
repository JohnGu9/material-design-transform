import React from 'react';
import { FadeThrough, SharedAxis, SharedAxisTransform } from './lib';
import "./App.css";

function App() {
  const [id, setId] = React.useState(0);
  return (
    <div className='App'>
      <span className='Center'>
        <button onClick={() => setId(value => value + 1)}>change</button>
      </span>
      SharedAxis:
      <SharedAxis transform={SharedAxisTransform.fromBottomToTop} keyId={id}>{id}</SharedAxis>
      <SharedAxis transform={SharedAxisTransform.fromTopToBottom} keyId={id}>{id}</SharedAxis>
      <SharedAxis transform={SharedAxisTransform.fromRightToLeft} keyId={id}>{id}</SharedAxis>
      <SharedAxis transform={SharedAxisTransform.fromLeftToRight} keyId={id}>{id}</SharedAxis>
      <SharedAxis transform={SharedAxisTransform.fromFrontToBack} keyId={id}>{id}</SharedAxis>
      <SharedAxis transform={SharedAxisTransform.fromBackToFront} keyId={id}>{id}</SharedAxis>
      FadeThrough:
      <FadeThrough keyId={id}>{id}</FadeThrough>
    </div>

  );
}

export default App;
