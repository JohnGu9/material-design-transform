import React from "react";

type E<T> = T extends React.DetailedHTMLProps<React.HTMLAttributes<infer E>, infer E> ? E : never;
export type TagToElementType<T extends keyof JSX.IntrinsicElements> = E<JSX.IntrinsicElements[T]>;

export function createComponent<Element, Props>(render: React.ForwardRefRenderFunction<Element, Props & Omit<React.HTMLProps<Element>, keyof Props | "ref">>) {
  return React.forwardRef<Element, Props & Omit<React.HTMLProps<Element>, keyof Props | "ref">>(render);
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Curves {
  export function CubicBezier(x1: number, y1: number, x2: number, y2: number) {
    return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
  }
  export function Easing(outgoing: number, incoming: number) {
    return `cubic-bezier(${outgoing}, 0.0, ${(1 - incoming).toFixed(2)}, 1)`;
  }

  // reference: https://m2.material.io/design/motion/the-motion-system.html
  export const StandardEasing = Easing(0.4, 0.8);
  export const DeceleratedEasing = Easing(0.0, 0.8);
  export const AcceleratedEasing = Easing(0.4, 0.0);
  export const Linear = "linear";
  // export const EmphasizedEasing = undefined;

  // reference: https://m3.material.io/styles/motion/easing-and-duration/applying-easing-and-duration
  export const M3 = {
    Emphasized: CubicBezier(0.2, 0, 0, 1),
    EmphasizedDecelerate: CubicBezier(0.05, 0.7, 0.1, 1.0), // Enter the screen / md.sys.motion.duration.medium4
    EmphasizedAccelerate: CubicBezier(0.3, 0.0, 0.8, 0.15), // Exit the screen / md.sys.motion.duration.short4
    Standard: CubicBezier(0.2, 0, 0, 1),
    StandardDecelerate: CubicBezier(0, 0, 0, 1),
    StandardAccelerate: CubicBezier(0.3, 0, 1, 1),
    Legacy: CubicBezier(0.4, 0, 0.2, 1),
    LegacyDecelerate: CubicBezier(0, 0, 0.2, 1),
    LegacyAccelerate: CubicBezier(0.4, 0, 1, 1),
    Linear: "linear",
  };
}

// unit: ms
export const Duration = {
  // reference: https://m3.material.io/styles/motion/easing-and-duration/applying-easing-and-duration
  M3: {
    "md.sys.motion.duration.short1": 50,
    "md.sys.motion.duration.short2": 100,
    "md.sys.motion.duration.short3": 150,
    "md.sys.motion.duration.short4": 200,

    "md.sys.motion.duration.medium1": 250,
    "md.sys.motion.duration.medium2": 300,
    "md.sys.motion.duration.medium3": 350,
    "md.sys.motion.duration.medium4": 400,

    "md.sys.motion.duration.long1": 450,
    "md.sys.motion.duration.long2": 500,
    "md.sys.motion.duration.long3": 550,
    "md.sys.motion.duration.long4": 600,

    "md.sys.motion.duration.extra-long1": 700,
    "md.sys.motion.duration.extra-long2": 800,
    "md.sys.motion.duration.extra-long3": 900,
    "md.sys.motion.duration.extra-long4": 1000,
  },

};

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

type Range<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;

// from @material/elevation

const umbraOpacity = 0.2;
const penumbraOpacity = 0.14;
const ambientOpacity = 0.12;

const umbraMap = {
  0: '0px 0px 0px 0px',
  1: '0px 2px 1px -1px',
  2: '0px 3px 1px -2px',
  3: '0px 3px 3px -2px',
  4: '0px 2px 4px -1px',
  5: '0px 3px 5px -1px',
  6: '0px 3px 5px -1px',
  7: '0px 4px 5px -2px',
  8: '0px 5px 5px -3px',
  9: '0px 5px 6px -3px',
  10: '0px 6px 6px -3px',
  11: '0px 6px 7px -4px',
  12: '0px 7px 8px -4px',
  13: '0px 7px 8px -4px',
  14: '0px 7px 9px -4px',
  15: '0px 8px 9px -5px',
  16: '0px 8px 10px -5px',
  17: '0px 8px 11px -5px',
  18: '0px 9px 11px -5px',
  19: '0px 9px 12px -6px',
  20: '0px 10px 13px -6px',
  21: '0px 10px 13px -6px',
  22: '0px 10px 14px -6px',
  23: '0px 11px 14px -7px',
  24: '0px 11px 15px -7px',
};

const penumbraMap = {
  0: '0px 0px 0px 0px',
  1: '0px 1px 1px 0px',
  2: '0px 2px 2px 0px',
  3: '0px 3px 4px 0px',
  4: '0px 4px 5px 0px',
  5: '0px 5px 8px 0px',
  6: '0px 6px 10px 0px',
  7: '0px 7px 10px 1px',
  8: '0px 8px 10px 1px',
  9: '0px 9px 12px 1px',
  10: '0px 10px 14px 1px',
  11: '0px 11px 15px 1px',
  12: '0px 12px 17px 2px',
  13: '0px 13px 19px 2px',
  14: '0px 14px 21px 2px',
  15: '0px 15px 22px 2px',
  16: '0px 16px 24px 2px',
  17: '0px 17px 26px 2px',
  18: '0px 18px 28px 2px',
  19: '0px 19px 29px 2px',
  20: '0px 20px 31px 3px',
  21: '0px 21px 33px 3px',
  22: '0px 22px 35px 3px',
  23: '0px 23px 36px 3px',
  24: '0px 24px 38px 3px',
};

const ambientMap = {
  0: '0px 0px 0px 0px',
  1: '0px 1px 3px 0px',
  2: '0px 1px 5px 0px',
  3: '0px 1px 8px 0px',
  4: '0px 1px 10px 0px',
  5: '0px 1px 14px 0px',
  6: '0px 1px 18px 0px',
  7: '0px 2px 16px 1px',
  8: '0px 3px 14px 2px',
  9: '0px 3px 16px 2px',
  10: '0px 4px 18px 3px',
  11: '0px 4px 20px 3px',
  12: '0px 5px 22px 4px',
  13: '0px 5px 24px 4px',
  14: '0px 5px 26px 4px',
  15: '0px 6px 28px 5px',
  16: '0px 6px 30px 5px',
  17: '0px 6px 32px 5px',
  18: '0px 7px 34px 6px',
  19: '0px 7px 36px 6px',
  20: '0px 8px 38px 7px',
  21: '0px 8px 40px 7px',
  22: '0px 8px 42px 7px',
  23: '0px 9px 44px 8px',
  24: '0px 9px 46px 8px',
};

export function elevationBoxShadow(level: Range<1, 25>, rgb?: string, opacityBoost?: number) {
  rgb ??= '0, 0, 0';
  opacityBoost ??= 0;

  const umbraZValue = umbraMap[level];
  const penumbraZValue = penumbraMap[level];
  const ambientZValue = ambientMap[level];

  const umbraColor = `rgba(${rgb}, ${umbraOpacity + opacityBoost})`;
  const penumbraColor = `rgba(${rgb}, ${penumbraOpacity + opacityBoost})`;
  const ambientColor = `rgba(${rgb}, ${ambientOpacity + opacityBoost})`;

  return `${umbraZValue} ${umbraColor}, ${penumbraZValue} ${penumbraColor}, ${ambientZValue} ${ambientColor}`;
}
