import { Property } from 'csstype';
import React from "react";
import { createComponent, Curves, Duration, TagToElementType } from "./common";
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

  /* y-axis */
  fromBottomToTopM3,
  fromTopToBottomM3,
  /* x-axis */
  fromLeftToRightM3,
  fromRightToLeftM3,
  /* z-axis */
  fromFrontToBackM3,
  fromBackToFrontM3,
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

function standardAnimationBuilder(enterTransform: Property.Transform, exitTransform: Property.Transform, duration: number, curves: { decelerated: string, accelerated: string, normal: string; }): AnimationSteps {
  const segment = duration / 20;
  function getDuration(segmentAmount: number) {
    return (segment * segmentAmount).toFixed(0);
  }
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
        transition: `transform ${getDuration(14)}ms ${curves.decelerated} 0ms, opacity ${getDuration(14)}ms ${curves.normal} 0ms`,
        willChange: 'transition',
      },
      duration: segment * 14,
    },
    entered: {
      style: {
      },
    },
    exit: {
      style: {
        opacity: 0,
        transform: exitTransform,
        transition: `transform ${getDuration(6)}ms ${curves.accelerated} 0ms, opacity ${getDuration(6)}ms ${curves.normal} 0ms`,
        pointerEvents: "none",
        willChange: 'transform, opacity, transition, pointer-events',
      },
      duration: segment * 6,
    },
  };
}

function standardAnimationBuilderM3(enterTransform: Property.Transform, exitTransform: Property.Transform): AnimationSteps {
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
        transition: `transform ${Duration.M3['md.sys.motion.duration.medium4']}ms ${Curves.M3.EmphasizedDecelerate} 0ms, opacity ${Duration.M3['md.sys.motion.duration.medium4']}ms ${Curves.M3.Emphasized} 0ms`,
        willChange: 'transition',
      },
      duration: Duration.M3['md.sys.motion.duration.medium4'],
    },
    entered: {
      style: {
      },
    },
    exit: {
      style: {
        opacity: 0,
        transform: exitTransform,
        transition: `transform ${Duration.M3['md.sys.motion.duration.short4']}ms ${Curves.M3.EmphasizedAccelerate} 0ms, opacity ${Duration.M3['md.sys.motion.duration.short4']}ms ${Curves.M3.Emphasized} 0ms`,
        pointerEvents: "none",
        willChange: 'transform, opacity, transition, pointer-events',
      },
      duration: Duration.M3['md.sys.motion.duration.short4'],
    },
  };
}

const curvesM2 = {
  decelerated: Curves.DeceleratedEasing, accelerated: Curves.AcceleratedEasing, normal: Curves.Linear,
};

const durationM2 = 300;

// reference: https://angrytools.com/android/pixelcalc/
// Although m2 document said: When designing for the web, replace dp with px (for pixel),
// the pixel unit is inconstant.
// Replace px with pt.
function dpToPt(dp: number) {
  // 72dpi: 1pt = 1px
  // 160dpi: 1dp = 1px 
  // 1pt => 1/72 in
  // 1dp => 1/160 in
  // 1dp => 72/160 pt
  return dp * 72 / 160;
}

const dp21 = `${dpToPt(21).toFixed(0)}pt`;
const dp9 = `${dpToPt(9).toFixed(0)}pt`;


const dp20 = `${dpToPt(20).toFixed(0)}pt`;
const dp10 = `${dpToPt(10).toFixed(0)}pt`;

const standardAnimation = {
  [SharedAxisTransform.fromBottomToTop]: standardAnimationBuilder(`translateY(${dp21})`, `translateY(-${dp9})`, durationM2, curvesM2),
  [SharedAxisTransform.fromTopToBottom]: standardAnimationBuilder(`translateY(-${dp21})`, `translateY(${dp9})`, durationM2, curvesM2),
  [SharedAxisTransform.fromRightToLeft]: standardAnimationBuilder(`translateX(${dp21})`, `translateX(-${dp9})`, durationM2, curvesM2),
  [SharedAxisTransform.fromLeftToRight]: standardAnimationBuilder(`translateX(-${dp21})`, `translateX(${dp9})`, durationM2, curvesM2),
  [SharedAxisTransform.fromFrontToBack]: standardAnimationBuilder('scale(1.1)', 'scale(0.8)', durationM2, curvesM2),
  [SharedAxisTransform.fromBackToFront]: standardAnimationBuilder('scale(0.8)', 'scale(1.1)', durationM2, curvesM2),
  [SharedAxisTransform.fromBottomToTopM3]: standardAnimationBuilderM3(`translateY(${dp20})`, `translateY(-${dp10})`),
  [SharedAxisTransform.fromTopToBottomM3]: standardAnimationBuilderM3(`translateY(-${dp20})`, `translateY(${dp10})`),
  [SharedAxisTransform.fromRightToLeftM3]: standardAnimationBuilderM3(`translateX(${dp20})`, `translateX(-${dp10})`),
  [SharedAxisTransform.fromLeftToRightM3]: standardAnimationBuilderM3(`translateX(-${dp20})`, `translateX(${dp10})`),
  [SharedAxisTransform.fromFrontToBackM3]: standardAnimationBuilderM3('scale(1.1)', 'scale(0.8)'),
  [SharedAxisTransform.fromBackToFrontM3]: standardAnimationBuilderM3('scale(0.8)', 'scale(1.1)'),
};

function toAnimationSteps(transform: SharedAxisTransform): AnimationSteps {
  return standardAnimation[transform] ?? standardAnimation[SharedAxisTransform.fromBottomToTop];
}
