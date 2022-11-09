import React from "react";

type E<T> = T extends React.DetailedHTMLProps<React.HTMLAttributes<infer E>, infer E> ? E : never;
export type TagToElementType<T extends keyof JSX.IntrinsicElements> = E<JSX.IntrinsicElements[T]>;

export function createComponent<Element, Props>(render: React.ForwardRefRenderFunction<Element, Props & Omit<React.HTMLProps<Element>, keyof Props>>) {
  return React.forwardRef<Element, Props & Omit<React.HTMLProps<Element>, keyof Props>>(render);
}

export namespace Curves {
  export function Easing(outgoing?: number, incoming?: number) {
    return `cubic-bezier(${outgoing ?? 0.0}, 0.0, ${1 - (incoming ?? 0.0)}, 1)`;
  }

  export const StandardEasing = Easing(0.4, 0.8);
  // export const EmphasizedEasing = undefined;
  export const DeceleratedEasing = Easing(0.0, 0.8);
  export const AcceleratedEasing = Easing(0.4, 0.0);
}

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

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
