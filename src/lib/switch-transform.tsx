import { createElement, CSSProperties, Fragment, Key, useEffect, useMemo, useRef, useState } from 'react';
import { useRefComposer } from "react-ref-composer";
import { createComponent, TagToElementType } from './common';

enum AnimationState { firstFrame, enter, entered, exit };

type AnimationTransition = {
  style: CSSProperties,
  duration: number, // unit: ms
};

export type AnimationSteps = {
  firstFrame: Omit<AnimationTransition, 'duration'>,
  enter: AnimationTransition,
  entered: Omit<AnimationTransition, 'duration'>,
  exit: AnimationTransition,
};

export type SwitchTransformProps = {
  keyId?: Key | null | undefined,
  steps: AnimationSteps,

  /* In normal case, this argument is useless because switch animation is usually used to switch between two different type component */
  /* Switch between two different type component would trigger react to rebuild the component tree */
  /* This argument only valid when switch on same type component */
  /* But do you really need to rebuild same type component? Animation is not enough? */
  forceRebuildAfterSwitched?: boolean,
};

export function buildSwitchTransform<T extends keyof JSX.IntrinsicElements, Element = TagToElementType<T>>(tag: T) {
  return createComponent<Element, SwitchTransformProps>(
    function ({
      keyId,
      forceRebuildAfterSwitched = true,
      steps,
      style,
      children,
      ...props }, ref) {
      const composeRefs = useRefComposer();
      const innerRef = useRef<HTMLElement>(null);
      const state = useMemo(() => {
        return { keyId, children, animationState: AnimationState.entered, steps };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      const [, setTicker] = useState(Number.MIN_SAFE_INTEGER);
      const updateNotify = () => setTicker(value => {
        if (value >= Number.MAX_SAFE_INTEGER) { // unlikely
          return Number.MIN_SAFE_INTEGER;
        }
        return value + 1;
      });

      switch (state.animationState) {
        case AnimationState.firstFrame: {
          state.keyId = keyId;
          state.steps = steps;
          break;
        }
        case AnimationState.entered: {
          state.steps = steps;
          break;
        }
        // lock steps when enter or exit
      }

      const changed = state.keyId !== keyId;

      if (!changed) {
        state.children = children;
      } // lock children when key changed

      useEffect(() => {
        // using js timer instead of transition end callback
        // so it no longer support debug when turn on animation slow down in browser dev tools
        // but more robust than before
        if (changed) {// assert state.animationState !== AnimationState.firstFrame
          switch (state.animationState) {
            case AnimationState.firstFrame:
            case AnimationState.exit: {
              return; // nothing to do, should never enter this branch
            }
          }

          // state.animationState === AnimationState.enter;
          // state.animationState === AnimationState.entered;
          state.animationState = AnimationState.exit;
          const timer = setTimeout(() => {
            state.animationState = AnimationState.firstFrame;
            updateNotify();
          }, state.steps.exit.duration);
          updateNotify();
          return () => clearTimeout(timer);
        } else /* changed === false */ {
          switch (state.animationState) {
            case AnimationState.enter:
            case AnimationState.entered: {
              return; // nothing to do, should never enter this branch
            }
            case AnimationState.firstFrame: {
              innerRef.current!.getBoundingClientRect(); // force layout
              break;
            }
          }

          // state.animationState === AnimationState.firstFrame         
          // state.animationState === AnimationState.exit
          state.animationState = AnimationState.enter;
          const timer = setTimeout(() => {
            state.animationState = AnimationState.entered;
            updateNotify();
          }, state.steps.enter.duration);
          updateNotify();
          return () => clearTimeout(timer);
        }
      }, [changed, state]);

      return createElement(tag, {
        style: { ...currentStyle(state.animationState, state.steps), ...style },
        ref: composeRefs(innerRef, ref),
        ...props,
      }, <Fragment key={forceRebuildAfterSwitched ? state.keyId : undefined}>
        {state.children}
      </Fragment>);
    });
}

function currentStyle(animationState: AnimationState, steps: AnimationSteps) {
  switch (animationState) {
    case AnimationState.firstFrame:
      return steps.firstFrame.style;
    case AnimationState.enter:
      return steps.enter.style;
    case AnimationState.entered:
      return steps.entered.style;
    case AnimationState.exit:
      return steps.exit.style;
  }
}
