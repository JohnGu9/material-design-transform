import React, { createContext, createElement, Fragment, useEffect, useMemo, useRef } from "react";
import { useRefComposer } from "react-ref-composer";
import { createComponent, Curves, TagToElementType } from "./common";
import { Key, useOverlayTransform, useOverlayTransformLayout } from "./overlay-transform";

export enum ContainerFit { width, height, both };

export type ContainerTransformProps = {
  keyId: Key,
  mock?: React.ReactNode,
  container?: React.ReactNode,
  containerFit?: ContainerFit,
};

export const ContainerTransform = buildContainerTransform('div');

export function buildContainerTransform<T extends keyof JSX.IntrinsicElements, Element = TagToElementType<T>>(tag: T) {
  return createComponent<Element, ContainerTransformProps>(
    function ({
      keyId,
      mock,
      container,
      containerFit = ContainerFit.width,
      style,
      ...props }, ref) {
      const composeRefs = useRefComposer();
      const innerRef = useRef<HTMLElement>(null);
      const isOpened = useOverlayTransform(keyId,
        ContainerTransformLayoutContext,
        () => {
          return {
            tag, container, mock, containerFit,
            props: { style, ...props } as React.HTMLProps<HTMLElement>,
            element: innerRef.current!,
          };
        });

      return createElement(tag, {
        style: {
          visibility: isOpened ? 'hidden' : undefined,
          pointerEvents: isOpened ? 'none' : undefined,
          ...style,
        },
        ref: composeRefs(innerRef, ref),
        ...props
      });
    }
  );
}

export type OverlayPosition = {
  /* number: 0 mean 0%, 1 mean 100% */
  centerX: number, /* 50% mean center */
  centerY: number,/* 50% mean center */
  width: number,/* 100% mean full width */
  height: number/* 100% mean full height */
};

export type Overlay = {
  tag: string, props: React.HTMLProps<HTMLElement>, element: HTMLElement,
  mock?: React.ReactNode,
  container: React.ReactNode,
  containerFit: ContainerFit,
};

export const ContainerTransformLayoutContext = createContext({
  keyId: undefined as Key | undefined,
  overlays: {} as { [key: Key]: Overlay | undefined },
});

export type ContainerTransformLayoutProps = {
  keyId?: Key,
  overlayPosition?: OverlayPosition,
  overlayStyle?: Omit<React.CSSProperties, 'left' | 'right' | 'top' | 'bottom' | 'width' | 'height' | 'transform'>,
  onScrimClick?: React.MouseEventHandler<HTMLDivElement>,
};

export const ContainerTransformLayout = buildContainerTransformLayout('div');

export function buildContainerTransformLayout<T extends keyof JSX.IntrinsicElements, Element = TagToElementType<T>>(tag: T) {
  return createComponent<Element, ContainerTransformLayoutProps>(
    function ({
      keyId,
      onScrimClick,
      overlayPosition = defaultOverlayPosition,
      overlayStyle = defaultOverlayStyle,
      children,
      style,
      ...props }, ref) {
      const composeRefs = useRefComposer();
      const innerRef = useRef<HTMLElement>(null);
      const scrimRef = useRef<HTMLDivElement>(null);
      const overlayRef = useRef<HTMLElement>(null);
      const originRef = useRef<HTMLDivElement>(null);
      const containerRef = useRef<HTMLDivElement>(null);
      const containerWrapperRef = useRef<HTMLDivElement>(null);
      const overlays = useMemo(() => { return {} as { [key: Key]: Overlay }; }, []);
      const { overlay, animationState, onEnter, onExited,
        keyId: currentKeyId } = useOverlayTransformLayout(keyId, overlays);

      const hasOverlay = overlay !== undefined;
      const overlayShow = animationState === true;

      useEffect(() => {
        if (hasOverlay) {
          scrimRef.current?.getBoundingClientRect();
          overlayRef.current?.getBoundingClientRect();
          originRef.current?.getBoundingClientRect();
          containerRef.current?.getBoundingClientRect();
          containerWrapperRef.current?.getBoundingClientRect();
          onEnter();
        }
      }, [hasOverlay, onEnter]);

      return createElement(tag, {
        style: { position: 'relative', ...style },
        ref: composeRefs(innerRef, ref),
        ...props,
      }, [
        <ContainerTransformLayoutContext.Provider
          key={0}
          value={{
            keyId: currentKeyId,
            overlays: overlays,
          }}>
          {children}
        </ContainerTransformLayoutContext.Provider>,
        /* scrim */
        hasOverlay
          ? <div key={1}
            ref={scrimRef}
            style={{
              ...fullSizeStyle,
              backgroundColor: 'rgba(0, 0, 0, 0.32)',
              pointerEvents: overlayShow ? undefined : 'none',
              opacity: overlayShow ? 1 : 0,
              transition: overlayShow
                ? `opacity 90ms ${Curves.Easing(0, 0)}`
                : `opacity 250ms ${Curves.StandardEasing}`,
            }}
            onClick={onScrimClick}
            onTransitionEnd={animationState === false
              ? event => {
                if (event.target === scrimRef.current && event.propertyName === 'opacity') {
                  onExited();
                }
              }
              : undefined} />
          : <Fragment key={1} />,
        /* overlay */
        hasOverlay
          ? createElement(overlay.tag, {
            ...(overlay.props),
            key: 2,
            ref: overlayRef,
            style: {
              ...overlay.props.style,
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
              transitionProperty: 'left, top, width, height, box-shadow, border-radius',
              transitionDuration: '250ms',
              transitionTimingFunction: Curves.StandardEasing,
              ...(overlayShow
                ? overlayStyleToStyle(overlayStyle, overlayPosition)
                : relativeCenterPosition(
                  overlay.element,
                  innerRef.current!)),
            },
          },
            <div
              ref={originRef}
              style={{
                ...fullSizeStyle,
                ...centerStyle,
                pointerEvents: overlayShow ? 'none' : undefined,
                opacity: overlayShow ? 0 : 1,
                transition: overlayShow
                  ? 'opacity 60ms linear 60ms'
                  : 'opacity 133ms linear 117ms',
              }}>
              {overlay.mock ?? overlay.props.children}
            </div>)
          : <Fragment key={2} />,
        hasOverlay
          ? <div
            key={3}
            ref={containerRef}
            style={{
              ...centerStyle,
              position: 'absolute',
              transformOrigin: 'center',
              left: '50%',
              top: '50%',
              width: '100%',
              height: '100%',
              pointerEvents: overlayShow ? undefined : 'none',
              opacity: overlayShow ? 1 : 0,
              transform: overlayShow
                ? distTransform(overlayPosition)
                : srcTransform(overlay.element, innerRef.current!, overlayPosition, overlay.containerFit),
              transition: overlayShow
                ? showTransition
                : hiddenTransition,

            }}>
            <div
              ref={containerWrapperRef}
              style={{
                overflow: 'hidden',
                transitionProperty: 'height, width, border-radius',
                transitionDuration: '250ms',
                transitionTimingFunction: Curves.StandardEasing,
                borderRadius: overlayShow
                  ? distBorderRadius(overlayStyle)
                  : srcBorderRadius(overlay.element),
                ...(overlayShow
                  ? {
                    width: `${overlayPosition.width * 100}%`,
                    height: `${overlayPosition.height * 100}%`,
                  } : compensateSize(overlay.element, innerRef.current!, overlayPosition, overlay.containerFit))
              }}>
              {overlay.container}
            </div>
          </div>
          : <Fragment key={3} />,
      ]);
    }
  );
}

const showTransition = buildTransition('opacity 120ms linear 125ms', ['transform'], '250ms', Curves.StandardEasing);
const hiddenTransition = buildTransition('opacity 50ms linear 67ms', ['transform'], '250ms', Curves.StandardEasing);

function buildTransition(start: string, property: string[], duration: string, curve: string) {
  return [start, ...property.map(value => `${value} ${duration} ${curve}`)].join(', ');
}

const fullSizeStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
}

const centerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const defaultOverlayPosition: OverlayPosition = {
  centerX: 0.5,
  centerY: 0.5,
  width: 1,
  height: 1,
}

const defaultOverlayStyle = {
  boxShadow: '0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12)',
  borderRadius: 0,
}

function overlayStyleToStyle(css: React.CSSProperties, position: OverlayPosition): React.CSSProperties {
  return {
    ...css,
    left: `${position.centerX * 100}%`,
    top: `${position.centerY * 100}%`,
    width: `${position.width * 100}%`,
    height: `${position.height * 100}%`,
  };
}

function relativeCenterPosition(child: HTMLElement, parent: HTMLElement): React.CSSProperties {
  const c = child.getBoundingClientRect();
  const p = parent.getBoundingClientRect();
  return {
    left: `${(c.left - p.left + c.width / 2) / p.width * 100}%`,
    top: `${(c.top - p.top + c.height / 2) / p.height * 100}%`,
    width: `${c.width / p.width * 100}%`,
    height: `${c.height / p.height * 100}%`,
    willChange: 'left, top, width, height, box-shadow, border-radius',
  };
}

function distTransform(position: OverlayPosition) {
  return `translate(${(position.centerX - 1) * 100}%, ${(position.centerY - 1) * 100}%) scale(1, 1)`;
}

function srcTransform(child: HTMLElement, parent: HTMLElement, position: OverlayPosition, containerFit: ContainerFit) {
  const c = child.getBoundingClientRect();
  const p = parent.getBoundingClientRect();
  switch (containerFit) {
    case ContainerFit.both:
      return `translate(${((c.left - p.left + c.width / 2) / p.width - 1) * 100}%, ${((c.top - p.top + c.height / 2) / p.height - 1) * 100}%) scale(${(c.width / p.width) / position.width}, ${(c.height / p.height) / position.height})`;
    case ContainerFit.width: {
      const ratio = (c.width / p.width) / position.width;
      const originShift = (c.top - p.top + c.height / 2) / p.height - 1;
      return `translate(${((c.left - p.left + c.width / 2) / p.width - 1) * 100}%, ${originShift * 100}%) scale(${ratio}, ${ratio})`;
    }
    case ContainerFit.height: {
      const ratio = (c.height / p.height) / position.height;
      const originShift = (c.left - p.left + c.width / 2) / p.width - 1;
      return `translate(${originShift * 100}%, ${((c.top - p.top + c.height / 2) / p.height - 1) * 100}%) scale(${ratio}, ${ratio})`;
    }
  }
}

function compensateSize(child: HTMLElement, parent: HTMLElement, position: OverlayPosition, containerFit: ContainerFit): React.CSSProperties {
  switch (containerFit) {
    case ContainerFit.both:
      return {
        width: `${position.width * 100}%`,
        height: `${position.height * 100}%`,
      };
    case ContainerFit.height: {
      const c = child.getBoundingClientRect();
      const p = parent.getBoundingClientRect();
      const srcRatio = c.width / c.height;
      const distRatio = (p.width * position.width) / (p.height * position.height);
      return {
        width: `${position.width * srcRatio / distRatio * 100}%`,
        height: `${position.height * 100}%`,
      };
    }
    case ContainerFit.width: {
      const c = child.getBoundingClientRect();
      const p = parent.getBoundingClientRect();
      const srcRatio = c.width / c.height;
      const distRatio = (p.width * position.width) / (p.height * position.height);
      return {
        width: `${position.width * 100}%`,
        height: `${position.height * distRatio / srcRatio * 100}%`,
      };
    }
  }
}

function srcBorderRadius(child: HTMLElement) {
  const s = getComputedStyle(child);
  return s.borderRadius;
}

function distBorderRadius(css: React.CSSProperties) {
  return css?.borderRadius;
}
