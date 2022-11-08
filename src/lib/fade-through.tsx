import { createComponent, Curves, TagToElementType } from "./common";
import { buildSwitchTransform } from "./switch-transform";

export type FadeThroughProps = {
  keyId?: React.Key | null | undefined,
  switchCancelable?: boolean, // switch can be cancel before exit animation complete
};

export const FadeThrough = buildFadeThrough('div');

export function buildFadeThrough<T extends keyof JSX.IntrinsicElements, Element = TagToElementType<T>>(tag: T) {
  const SwitchTransform = buildSwitchTransform<T, Element>(tag);
  return createComponent<Element, FadeThroughProps>(
    function Render(props, ref) {
      return <SwitchTransform transform={transform} {...props} ref={ref} />
    });
}

const transform = {
  enter: {
    opacity: {
      duration: 210,
      curve: Curves.DeceleratedEasing,
      delay: 0,
    },
    transform: {
      value: 'scale(0.92)',
      duration: 210,
      curve: Curves.StandardEasing,
      delay: 0,
    }
  },
  exit: {
    opacity: {
      duration: 90,
      curve: Curves.AcceleratedEasing,
      delay: 0,
    },
    transform: {
      value: 'scale(1)',
      duration: 90,
      curve: Curves.StandardEasing,
      delay: 0,
    }
  }
}

