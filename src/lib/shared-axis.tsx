import { Property } from 'csstype';
import { Key } from "react";
import { createComponent, Curves, Duration, TagToElementType } from "./common";
import { buildSwitchTransform, AnimationSteps } from './switch-transform';
import { SharedAxisContextProps, SharedAxisTransform, useSharedAxisContext } from './context';

export { SharedAxisTransform };

export type SharedAxisProps = {
  keyId?: Key | null | undefined,
  forceRebuildAfterSwitched?: boolean,
} & SharedAxisContextProps;

export const SharedAxis = buildSharedAxis('div');

export function buildSharedAxis<T extends keyof JSX.IntrinsicElements, Element = TagToElementType<T>>(tag: T) {
  const SwitchTransform = buildSwitchTransform<T, Element>(tag);
  return createComponent<Element, SharedAxisProps>(
    function Render({ transform, transitionStyle, unit, ...props }, ref) {
      const context = useSharedAxisContext({ transform, transitionStyle, unit });
      return <SwitchTransform steps={toAnimationSteps(context)} {...props} ref={ref} />;
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
      duration: Math.round(segment * 14),
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
      duration: Math.round(segment * 6),
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


function buildStandardAnimation(incomingSlide: string, outgoingSlide: string) {
  return {
    [SharedAxisTransform.fromBottomToTop]: standardAnimationBuilder(`translateY(${incomingSlide})`, `translateY(-${outgoingSlide})`, durationM2, curvesM2),
    [SharedAxisTransform.fromTopToBottom]: standardAnimationBuilder(`translateY(-${incomingSlide})`, `translateY(${outgoingSlide})`, durationM2, curvesM2),
    [SharedAxisTransform.fromRightToLeft]: standardAnimationBuilder(`translateX(${incomingSlide})`, `translateX(-${outgoingSlide})`, durationM2, curvesM2),
    [SharedAxisTransform.fromLeftToRight]: standardAnimationBuilder(`translateX(-${incomingSlide})`, `translateX(${outgoingSlide})`, durationM2, curvesM2),
    [SharedAxisTransform.fromFrontToBack]: standardAnimationBuilder('scale(1.1)', 'scale(0.8)', durationM2, curvesM2),
    [SharedAxisTransform.fromBackToFront]: standardAnimationBuilder('scale(0.8)', 'scale(1.1)', durationM2, curvesM2),
  };
}

const dp21 = `${dpToPt(21).toFixed(0)}pt`;
const dp9 = `${dpToPt(9).toFixed(0)}pt`;

const standardAnimationDp = buildStandardAnimation(dp21, dp9);
const standardAnimationPx = buildStandardAnimation("21px", "9px");

function buildStandardAnimationM3(incomingSlide: string, outgoingSlide: string) {
  return {
    [SharedAxisTransform.fromBottomToTop]: standardAnimationBuilderM3(`translateY(${incomingSlide})`, `translateY(-${outgoingSlide})`),
    [SharedAxisTransform.fromTopToBottom]: standardAnimationBuilderM3(`translateY(-${incomingSlide})`, `translateY(${outgoingSlide})`),
    [SharedAxisTransform.fromRightToLeft]: standardAnimationBuilderM3(`translateX(${incomingSlide})`, `translateX(-${outgoingSlide})`),
    [SharedAxisTransform.fromLeftToRight]: standardAnimationBuilderM3(`translateX(-${incomingSlide})`, `translateX(${outgoingSlide})`),
    [SharedAxisTransform.fromFrontToBack]: standardAnimationBuilderM3('scale(1.1)', 'scale(0.8)'),
    [SharedAxisTransform.fromBackToFront]: standardAnimationBuilderM3('scale(0.8)', 'scale(1.1)'),
  };
}

const dp20 = `${dpToPt(20).toFixed(0)}pt`;
const dp10 = `${dpToPt(10).toFixed(0)}pt`;

const standardAnimationM3Dp = buildStandardAnimationM3(dp20, dp10);
const standardAnimationM3Px = buildStandardAnimationM3("20px", "10px");

function toAnimationSteps(props: Required<SharedAxisContextProps>): AnimationSteps {
  switch (props.transitionStyle) {
    case 'M2': {
      const standardAnimation = (props.unit === "dp" ? standardAnimationDp : standardAnimationPx);
      return standardAnimation[props.transform] ?? standardAnimation[SharedAxisTransform.fromBottomToTop];
    }
    case 'M3': {
      const standardAnimationM3 = (props.unit === "dp" ? standardAnimationM3Dp : standardAnimationM3Px);
      return standardAnimationM3[props.transform] ?? standardAnimationM3[SharedAxisTransform.fromBottomToTop];
    }
  }
}
