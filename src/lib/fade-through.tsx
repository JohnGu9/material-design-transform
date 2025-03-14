import { createComponent, Curves, Duration, TagToElementType } from "./common";
import { FadeThroughContextProps, useFadeThroughContext } from "./context";
import { buildSwitchTransform, AnimationSteps } from "./switch-transform";

export type FadeThroughProps = {
  keyId?: React.Key | null | undefined,
  forceRebuildAfterSwitched?: boolean,
} & FadeThroughContextProps;

export const FadeThrough = buildFadeThrough('div');

export function buildFadeThrough<T extends keyof JSX.IntrinsicElements, Element = TagToElementType<T>>(tag: T) {
  const SwitchTransform = buildSwitchTransform<T, Element>(tag);
  return createComponent<Element, FadeThroughProps>(
    function Render({ transitionStyle, ...props }, ref) {
      const context = useFadeThroughContext({ transitionStyle });
      return <SwitchTransform steps={getStep(context)} {...props} ref={ref} />;
    });
}

function getStep(props: Required<FadeThroughContextProps>) {
  switch (props.transitionStyle) {
    case "M3":
      return stepsM3;
    default:
      return steps;
  }
}

const steps: AnimationSteps = {
  firstFrame: {
    style: {
      opacity: 0,
      transform: 'scale(0.92)',
      willChange: 'transform, opacity, transition',
    },
  },
  enter: {
    style: {
      transition: `transform 210ms ${Curves.StandardEasing} 0ms, opacity 210ms ${Curves.DeceleratedEasing} 0ms`,
      willChange: 'transition',
    },
    duration: 210, // Math.max(210+0, 210+0)
  },
  entered: {
    style: {
    },
  },
  exit: {
    style: {
      opacity: 0,
      transition: `transform 90ms ${Curves.StandardEasing} 0ms, opacity 90ms ${Curves.AcceleratedEasing} 0ms`,
      pointerEvents: "none",
      willChange: 'transform, opacity, transition, pointer-events',
    },
    duration: 90,
  }
};

const stepsM3: AnimationSteps = {
  firstFrame: {
    style: {
      opacity: 0,
      transform: 'scale(0.92)',
      willChange: 'transform, opacity, transition',
    },
  },
  enter: {
    style: {
      transition: `transform ${Duration.M3['md.sys.motion.duration.medium4']}ms ${Curves.M3.EmphasizedDecelerate} 0ms, opacity ${Duration.M3['md.sys.motion.duration.medium4']}ms ${Curves.M3.Standard} 0ms`,
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
      transition: `transform ${Duration.M3['md.sys.motion.duration.short4']}ms ${Curves.M3.EmphasizedAccelerate} 0ms, opacity ${Duration.M3['md.sys.motion.duration.short4']}ms ${Curves.M3.Standard} 0ms`,
      pointerEvents: "none",
      willChange: 'transform, opacity, transition, pointer-events',
    },
    duration: Duration.M3['md.sys.motion.duration.short4'],
  }
}

