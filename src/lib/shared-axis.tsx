import { Property } from 'csstype';
import React from "react";
import { createComponent, Curves, TagToElementType } from "./common";
import { buildSwitchTransform, Transform } from './switch-transform';

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
  transform?: SharedAxisTransform,
};

export const SharedAxis = buildSharedAxis('div');

export function buildSharedAxis<T extends keyof JSX.IntrinsicElements, Element = TagToElementType<T>>(tag: T) {
  const SwitchTransform = buildSwitchTransform<T, Element>(tag);
  return createComponent<Element, SharedAxisProps>(
    function Render({ transform = SharedAxisTransform.fromBottomToTop, ...props }, ref) {
      return <SwitchTransform transform={animationToTransform(transform)} {...props} ref={ref} />
    });
}

function standardAnimationBuilder(enterTransform: Property.Transform, exitTransform: Property.Transform): Transform {
  return {
    enter: {
      opacity: {
        duration: 210,
        curve: Curves.DeceleratedEasing,
        delay: 0,
      },
      transform: {
        value: enterTransform,
        duration: 300,
        curve: Curves.StandardEasing,
        delay: -90,
      }
    },
    exit: {
      opacity: {
        duration: 90,
        curve: Curves.AcceleratedEasing,
        delay: 0,
      },
      transform: {
        value: exitTransform,
        duration: 300,
        curve: Curves.StandardEasing,
        delay: 0,
      }
    },
  }
}

const standardAnimation = {
  [SharedAxisTransform.fromBottomToTop]: standardAnimationBuilder('translateY(30px)', 'translateY(-30px)'),
  [SharedAxisTransform.fromTopToBottom]: standardAnimationBuilder('translateY(-30px)', 'translateY(30px)'),
  [SharedAxisTransform.fromRightToLeft]: standardAnimationBuilder('translateX(30px)', 'translateX(-30px)'),
  [SharedAxisTransform.fromLeftToRight]: standardAnimationBuilder('translateX(-30px)', 'translateX(30px)'),
  [SharedAxisTransform.fromFrontToBack]: standardAnimationBuilder('scale(1.1)', 'scale(0.8)'),
  [SharedAxisTransform.fromBackToFront]: standardAnimationBuilder('scale(0.8)', 'scale(1.1)'),
}

function animationToTransform(transform: SharedAxisTransform): Transform {
  return standardAnimation[transform];
}
