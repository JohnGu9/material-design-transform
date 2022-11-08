import { DataType, Property } from 'csstype';
import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import { useRefComposer } from "react-ref-composer";
import { createComponent, TagToElementType } from './common';

// @TODO: cancel animation feature

type AnimationTransition = {
  duration: number, // unit: ms, should never be 0
  curve: DataType.EasingFunction,
  delay: number, // unit: ms
};

type AnimationState = {
  opacity: AnimationTransition,
  transform: AnimationTransition & { value: Property.Transform },
}

export type Transform = {
  enter: AnimationState,
  exit: AnimationState,
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
        return { keyId, children, enterPrepareStyle, exitStyle, enterLock: false };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      const [, setTicker] = useState(false);
      const updateNotify = () => setTicker(value => !value);

      if (state.keyId !== keyId) {
        state.exitStyle ??= exitAnimation(transform);
      } else if (switchCancelable) {// state.keyId === keyId
        if (state.exitStyle) {
          state.exitStyle = undefined;
          state.enterLock = true;
        }
      }
      if (!state.exitStyle) {
        state.children = children;
      }
      const extendsStyle = state.enterLock
        ? (state.enterPrepareStyle ?? enterAnimation(transform))
        : state.exitStyle;
      const onTransitionEnd: React.TransitionEventHandler<Element> = (event) => {
        const { current } = innerRef;
        if (event.target === current &&
          event.propertyName === 'opacity') {
          const { style: { opacity } } = current;
          if (opacity === '1') {
            // enter end
            state.enterLock = false;
            updateNotify();
          } else if (opacity === '0') {
            // exit end
            state.keyId = keyId;
            state.exitStyle = undefined;
            state.enterPrepareStyle = enterPrepare(transform);
            state.enterLock = true;
            updateNotify();
          }
        }
        ote?.(event);
      };

      useEffect(() => {
        if (state.enterPrepareStyle) {
          innerRef.current!.getBoundingClientRect(); // force layout
          state.enterPrepareStyle = undefined;
          updateNotify();
        }
      }, [state.enterPrepareStyle, state]);

      return createElement(tag, {
        style: { ...extendsStyle, ...style },
        ref: composeRefs(innerRef, ref),
        onTransitionEnd,
        ...props,
      }, state.children);
    });
}

const enterPrepareStyle = undefined as React.CSSProperties | undefined;
const exitStyle = undefined as React.CSSProperties | undefined;

function enterPrepare({ enter: { transform } }: Transform): React.CSSProperties {
  return {
    willChange: 'transform, opacity, transition',
    transform: transform.value,
    opacity: 0,
  };
}

function enterAnimation({ enter: { transform, opacity } }: Transform): React.CSSProperties {
  return {
    opacity: 1,
    transition: `transform ${transform.duration}ms ${transform.curve} ${transform.delay}ms, opacity ${opacity.duration}ms ${opacity.curve} ${opacity.delay}ms`,
  };
}

function exitAnimation({ exit: { transform, opacity } }: Transform): React.CSSProperties {
  return {
    willChange: 'transform, transition, pointerEvents',
    pointerEvents: 'none',
    transform: transform.value,
    opacity: 0,
    transition: `transform ${transform.duration}ms ${transform.curve} ${transform.delay}ms, opacity ${opacity.duration}ms ${opacity.curve} ${opacity.delay}ms`,
  };
}
