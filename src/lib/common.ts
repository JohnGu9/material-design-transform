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
