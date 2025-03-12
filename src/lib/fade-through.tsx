import { createComponent, Curves, TagToElementType } from "./common";
import { buildSwitchTransform, AnimationSteps } from "./switch-transform";

export type FadeThroughProps = {
  keyId?: React.Key | null | undefined,
  forceRebuildAfterSwitched?: boolean,
};

export const FadeThrough = buildFadeThrough('div');

export function buildFadeThrough<T extends keyof JSX.IntrinsicElements, Element = TagToElementType<T>>(tag: T) {
  const SwitchTransform = buildSwitchTransform<T, Element>(tag);
  return createComponent<Element, FadeThroughProps>(
    function Render(props, ref) {
      return <SwitchTransform steps={steps} {...props} ref={ref} />;
    });
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
    duration: 90, // Math.max(90+0, 90+0)
  }
}

