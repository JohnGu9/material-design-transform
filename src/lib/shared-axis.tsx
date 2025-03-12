import { Property } from 'csstype';
import React from "react";
import { createComponent, Curves, TagToElementType } from "./common";
import { buildSwitchTransform, AnimationSteps } from './switch-transform';

export enum SharedAxisTransform {
  /* y-axis */
  fromBottomToTop,
  fromTopToBottom,
  /* x-axis */
  fromLeftToRight,
  fromRightToLeft,
  /* z-axis */
  fromFrontToBack,
  fromBackToFront,
};

export type SharedAxisProps = {
  keyId?: React.Key | null | undefined,
  forceRebuildAfterSwitched?: boolean,
  transform?: SharedAxisTransform,
};

export const SharedAxis = buildSharedAxis('div');

export function buildSharedAxis<T extends keyof JSX.IntrinsicElements, Element = TagToElementType<T>>(tag: T) {
  const SwitchTransform = buildSwitchTransform<T, Element>(tag);
  return createComponent<Element, SharedAxisProps>(
    function Render({ transform = SharedAxisTransform.fromBottomToTop, ...props }, ref) {
      return <SwitchTransform steps={toAnimationSteps(transform)} {...props} ref={ref} />;
    });
}

function standardAnimationBuilder(enterTransform: Property.Transform, exitTransform: Property.Transform): AnimationSteps {
  return {
    firstFrame: {
      style: {
        opacity: 0,
        transform: enterTransform,
        willChange: 'transform, opacity, transition'
      },
    },
    enter: {
      style: {
        transition: `transform 300ms ${Curves.StandardEasing} -90ms, opacity 210ms ${Curves.DeceleratedEasing} 0ms`,
        willChange: 'transition',
      },
      duration: 210, // Math.max(300-90, 210+0)
    },
    entered: {
      style: {
      },
    },
    exit: {
      style: {
        opacity: 0,
        transform: exitTransform,
        transition: `transform 300ms ${Curves.StandardEasing} 0ms, opacity 90ms ${Curves.AcceleratedEasing} 0ms`,
        pointerEvents: "none",
        willChange: 'transform, opacity, transition, pointer-events',
      },
      duration: 300, // Math.max(300-0, 90+0)
    },
  };
}

const standardAnimation = {
  [SharedAxisTransform.fromBottomToTop]: standardAnimationBuilder('translateY(30px)', 'translateY(-30px)'),
  [SharedAxisTransform.fromTopToBottom]: standardAnimationBuilder('translateY(-30px)', 'translateY(30px)'),
  [SharedAxisTransform.fromRightToLeft]: standardAnimationBuilder('translateX(30px)', 'translateX(-30px)'),
  [SharedAxisTransform.fromLeftToRight]: standardAnimationBuilder('translateX(-30px)', 'translateX(30px)'),
  [SharedAxisTransform.fromFrontToBack]: standardAnimationBuilder('scale(1.1)', 'scale(0.8)'),
  [SharedAxisTransform.fromBackToFront]: standardAnimationBuilder('scale(0.8)', 'scale(1.1)'),
};

function toAnimationSteps(transform: SharedAxisTransform): AnimationSteps {
  return standardAnimation[transform];
}
