import { DataType, Property } from 'csstype';
import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import { useRefComposer } from "react-ref-composer";
import { createComponent, TagToElementType } from './common';

enum AnimationState { firstFrame, enter, entered, exit };

// If there is no transition delay or duration, if both are 0s or neither is declared, there is no transition, and none of the transition events are fired. 
// https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event
type AnimationTransition = {
  duration: number, // unit: ms, should never be 0
  curve: DataType.EasingFunction,
  delay: number, // unit: ms
};

type AnimationTransitions = {
  opacity: AnimationTransition,
  transform: AnimationTransition & { value: Property.Transform },
}

export type Transform = {
  enter: AnimationTransitions,
  exit: AnimationTransitions,
};

export type SwitchTransformProps = {
  keyId?: unknown,
  switchCancelable?: boolean, // switch can be cancel before exit animation complete
  transform: Transform,
};

export function buildSwitchTransform<T extends keyof JSX.IntrinsicElements, Element = TagToElementType<T>>(tag: T) {
  return createComponent<Element, SwitchTransformProps>(
    function ({
      keyId,
      switchCancelable = true,
      transform,
      style,
      children,
      onTransitionEnd: ote,
      ...props }, ref) {
      const composeRefs = useRefComposer();
      const innerRef = useRef<HTMLElement>(null);
      const state = useMemo(() => {
        return { keyId, children, animationState: AnimationState.entered };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      const [, setTicker] = useState(false);
      const updateNotify = () => setTicker(value => !value);

      if (state.keyId !== keyId) {
        switch (state.animationState) {
          case AnimationState.firstFrame: {
            state.keyId = keyId;
            break;
          }
          default: {
            const style = getComputedStyle(innerRef.current!);
            if (style.opacity === '0') {
              state.animationState = AnimationState.firstFrame;
              state.keyId = keyId;
            } else {
              state.animationState = AnimationState.exit;
            }
          }
        }
      } else if (switchCancelable) {// && state.keyId === keyId
        if (state.animationState === AnimationState.exit) {
          const style = getComputedStyle(innerRef.current!);
          if (style.opacity === '1') {
            state.animationState = AnimationState.entered;
          } else {
            state.animationState = AnimationState.enter;
          }
        }
      }
      if (state.animationState !== AnimationState.exit) {
        state.children = children;
      }
      const onTransitionEnd: React.TransitionEventHandler<Element> = (event) => {
        const { current } = innerRef;
        if (event.target === current && event.propertyName === 'opacity') {
          const { style: { opacity } } = current;
          if (opacity === '1') {
            // enter end
            state.animationState = AnimationState.entered;
            updateNotify();
          } else if (opacity === '0') {
            // exit end
            state.keyId = keyId;
            state.animationState = AnimationState.firstFrame;
            updateNotify();
          }
        }
        ote?.(event);
      };

      const isFirstFrame = state.animationState === AnimationState.firstFrame;
      useEffect(() => {
        if (state.animationState === AnimationState.firstFrame) {
          innerRef.current!.getBoundingClientRect(); // force layout
          state.animationState = AnimationState.enter;
          updateNotify();
        }
      }, [isFirstFrame, state.keyId, state]);

      return createElement(tag, {
        style: { ...currentStyle(state.animationState, transform), ...style },
        ref: composeRefs(innerRef, ref),
        onTransitionEnd,
        ...props,
      }, state.children);
    });
}

function currentStyle(animationState: AnimationState, transform: Transform) {
  switch (animationState) {
    case AnimationState.firstFrame:
      return enterPrepare(transform);
    case AnimationState.enter:
      return enterAnimation(transform);
    case AnimationState.exit:
      return exitAnimation(transform);
  }
}

function enterPrepare({ enter: { transform } }: Transform): React.CSSProperties {
  return {
    opacity: 0,
    transform: transform.value,
    willChange: 'transform, opacity, transition',
  };
}

function enterAnimation({ enter: { transform, opacity } }: Transform): React.CSSProperties {
  return {
    opacity: 1,
    transition: `transform ${transform.duration}ms ${transform.curve} ${transform.delay}ms, opacity ${opacity.duration}ms ${opacity.curve} ${opacity.delay}ms`,
    willChange: 'transform, opacity, transition',
  };
}

function exitAnimation({ exit: { transform, opacity } }: Transform): React.CSSProperties {
  return {
    pointerEvents: 'none',
    opacity: 0,
    transform: transform.value,
    transition: `transform ${transform.duration}ms ${transform.curve} ${transform.delay}ms, opacity ${opacity.duration}ms ${opacity.curve} ${opacity.delay}ms`,
    willChange: 'transform, opacity, transition, pointer-events',
  };
}
