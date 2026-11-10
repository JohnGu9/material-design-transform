import { useRefComposer } from "react-ref-composer";
import { createComponent, TagToElementType } from './common';
import React from 'react';

enum AnimationState { firstFrame, enter, entered, exit };

type RequiredByKey<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
type AnimationTransition = {
  style: RequiredByKey<React.CSSProperties, 'transition'>,
  isTransitionEnd: (e: React.TransitionEvent) => boolean,
};

export type AnimationSteps = {
  firstFrame: { style: React.CSSProperties; },
  enter: AnimationTransition,
  entered: { style: React.CSSProperties; },
  exit: AnimationTransition,
};

export type SwitchTransformProps = {
  keyId?: React.Key | null | undefined,
  steps: AnimationSteps,

  /* In normal case, this argument is useless because switch animation is usually used to switch between two different type component */
  /* Switch between two different type component would trigger react to rebuild the component tree */
  /* This argument only valid when switch on same type component */
  /* But do you really need to rebuild same type component? Animation is not enough? */
  forceRebuildAfterSwitched?: boolean,
};

export function buildSwitchTransform<T extends keyof React.JSX.IntrinsicElements, Element = TagToElementType<T>>(tag: T) {
  return createComponent<Element, SwitchTransformProps>(
    function ({
      keyId,
      forceRebuildAfterSwitched = true,
      steps,
      style,
      children,
      onTransitionEnd,
      ...props }, ref) {
      const composeRefs = useRefComposer();
      const innerRef = React.useRef<HTMLElement>(null);
      const state = React.useMemo(() => {
        return { keyId, children, animationState: AnimationState.entered, steps };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      const [, setTicker] = React.useState(Number.MIN_SAFE_INTEGER);
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

      const isChanged = state.keyId !== keyId;
      if (!isChanged) {
        state.children = children;
      } // lock children when key changed

      React.useEffect(() => {
        // using js timer instead of transition end callback
        // so it no longer support debug when turn on animation slow down in browser dev tools
        // but more robust than before
        if (isChanged) {// assert state.animationState !== AnimationState.firstFrame
          switch (state.animationState) {
            case AnimationState.firstFrame:
            case AnimationState.exit: {
              return; // nothing to do, should never enter this branch
            }
          }

          // state.animationState === AnimationState.enter;
          // state.animationState === AnimationState.entered;
          state.animationState = AnimationState.exit;
          updateNotify();
          return;
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
          updateNotify();
          return;
        }
      }, [isChanged]);

      const _onTransitionEnd = React.useCallback((e: React.TransitionEvent<Element>) => {
        if (e.target === innerRef.current) {
          switch (state.animationState) {
            case AnimationState.enter: {
              if (state.steps.enter.isTransitionEnd(e as React.TransitionEvent)) {
                state.animationState = AnimationState.entered;
                updateNotify();
              }
              break;
            }
            case AnimationState.exit: {
              if (state.steps.exit.isTransitionEnd(e as React.TransitionEvent)) {
                state.animationState = AnimationState.firstFrame;
                updateNotify();
              }
              break;
            }
          }
        }
        onTransitionEnd?.(e);
      }, [onTransitionEnd]);

      return React.createElement(tag, {
        style: { ...currentStyle(state.animationState, state.steps), ...style },
        ref: composeRefs(innerRef, ref),
        onTransitionEnd: _onTransitionEnd,
        ...props,
      }, <React.Fragment key={forceRebuildAfterSwitched ? state.keyId : undefined}>
        {state.children}
      </React.Fragment>);
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
