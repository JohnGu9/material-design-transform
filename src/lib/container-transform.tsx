import React, { createContext, createElement, Fragment, useEffect, useMemo, useRef } from "react";
import { useRefComposer } from "react-ref-composer";
import { createComponent, Curves, elevationBoxShadow, TagToElementType } from "./common";
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
      containerFit,
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
  centerX: number, /* default: 0.5, 0.5 mean center */
  centerY: number,/* default: 0.5, 0.5 mean center */
  width: number,/* default: 1, 1 mean full width */
  height: number/* default: 1, 1 mean full height */
};

export type Overlay = {
  tag: string, props: React.HTMLProps<HTMLElement>, element: HTMLElement,
  mock?: React.ReactNode,
  container?: React.ReactNode,
  containerFit?: ContainerFit,
};

export const ContainerTransformLayoutContext = createContext({
  keyId: undefined as Key | undefined,
  overlays: {} as { [key: Key]: Overlay | undefined },
});

export type ContainerTransformLayoutProps = {
  keyId?: Key,
  overlayPosition?: Partial<OverlayPosition>,
  overlayStyle?: Omit<React.CSSProperties, 'left' | 'right' | 'top' | 'bottom' | 'width' | 'height' | 'transform'>,
  onScrimClick?: React.MouseEventHandler<HTMLDivElement>,
  container?: React.ReactNode,  /* if [ContainerTransform]'s container not set */
  containerFit?: ContainerFit,  /* if [ContainerTransform]'s containerFit not set */
};

export const ContainerTransformLayout = buildContainerTransformLayout('div');

export function buildContainerTransformLayout<T extends keyof JSX.IntrinsicElements, Element = TagToElementType<T>>(tag: T) {
  return createComponent<Element, ContainerTransformLayoutProps>(
    function ({
      keyId,
      onScrimClick,
      overlayPosition,
      overlayStyle = defaultOverlayStyle,
      container,
      containerFit = ContainerFit.width,
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
        keyId: currentKeyId } = useOverlayTransformLayout(keyId, getOverlay(keyId, overlays, container, containerFit));

      const position = getPosition(overlayPosition);
      const hasOverlay = overlay !== undefined;
      const overlayShow: boolean = animationState === true;

      useEffect(() => {
        if (hasOverlay && animationState === undefined) {
          scrimRef.current?.getBoundingClientRect();
          overlayRef.current?.getBoundingClientRect();
          originRef.current?.getBoundingClientRect();
          containerRef.current?.getBoundingClientRect();
          containerWrapperRef.current?.getBoundingClientRect();
          onEnter();
        } else if (animationState === false) {
          const { current } = scrimRef;
          if (current) {
            const style = getComputedStyle(current);
            if (style.opacity === '0') onExited();
          }
        }
      }, [hasOverlay, animationState, onEnter, onExited]);

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
              transition: overlayShow ? scrimShowTransition : scrimHiddenTransition,
              willChange: animationState === undefined ? 'pointer-events, opacity, transition' : undefined,
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
                ? overlayStyleToStyle(overlayStyle, position)
                : relativeCenterPosition(overlay.element, innerRef.current!)),
              willChange: animationState === undefined ? 'left, top, width, height, box-shadow, border-radius' : undefined,

            },
          },
            <div
              ref={originRef}
              style={{
                ...fullSizeStyle,
                ...centerStyle,
                pointerEvents: overlayShow ? 'none' : undefined,
                opacity: overlayShow ? 0 : 1,
                transition: overlayShow ? 'opacity 60ms linear 60ms' : 'opacity 133ms linear 117ms',
                willChange: animationState === undefined ? 'pointer-events, opacity, transition' : undefined,
              }}>
              {overlay.mock ?? overlay.props.children}
            </div>)
          : <Fragment key={2} />,
        /* container */
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
              pointerEvents: 'none',
              opacity: overlayShow ? 1 : 0,
              transform: overlayShow
                ? distTransform(position)
                : srcTransform(overlay.element, innerRef.current!, position, overlay.containerFit),
              transition: overlayShow ? containerShowTransition : containerHiddenTransition,
              willChange: animationState === undefined ? 'pointer-events, opacity, transform, transition' : undefined,
            }}>
            <div
              ref={containerWrapperRef}
              style={{
                position: 'relative',
                overflow: 'hidden',
                transitionProperty: 'height, width, border-radius',
                transitionDuration: '250ms',
                transitionTimingFunction: Curves.StandardEasing,
                pointerEvents: overlayShow ? 'auto' : 'none',
                borderRadius: overlayShow
                  ? distBorderRadius(overlayStyle)
                  : srcBorderRadius(overlay.element),
                ...(overlayShow
                  ? { width: `${position.width * 100}%`, height: `${position.height * 100}%` }
                  : compensateSize(overlay.element, innerRef.current!, position, overlay.containerFit)),
                willChange: animationState === undefined ? 'height, width, border-radius' : undefined,
              }}>
              {overlay.container}
            </div>
          </div>
          : <Fragment key={3} />,
      ]);
    }
  );
}

function getOverlay(keyId: Key | undefined, overlays: { [key: Key]: Overlay }, container: React.ReactNode, containerFit: ContainerFit) {
  if (keyId === undefined) return undefined;
  const overlay = overlays[keyId];
  if (overlay === undefined) return undefined;
  return {
    ...overlays[keyId],
    container: overlay.container ?? container,
    containerFit: overlay.containerFit ?? containerFit,
  }
}
const scrimShowTransition = `opacity 90ms ${Curves.Easing(0, 0)}`;
const scrimHiddenTransition = `opacity 250ms ${Curves.StandardEasing}`;

const containerShowTransition = buildTransition('opacity 120ms linear 125ms', ['transform'], '250ms', Curves.StandardEasing);
const containerHiddenTransition = buildTransition('opacity 50ms linear 67ms', ['transform'], '250ms', Curves.StandardEasing);

function buildTransition(start: string, property: string[], duration: string, curve: string) {
  return [start, ...property.map(value => `${value} ${duration} ${curve}`)].join(', ');
}

function getPosition(position: Partial<OverlayPosition> | undefined): OverlayPosition {
  return {
    centerX: position?.centerX ?? 0.5,
    centerY: position?.centerY ?? 0.5,
    width: position?.width ?? 1,
    height: position?.height ?? 1,
  };
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

const defaultOverlayStyle = {
  boxShadow: elevationBoxShadow(24),
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
      return `translate(${((c.left - p.left + c.width / 2) / p.width - 1) * 100}%, ${((c.top - p.top + c.height / 2) / p.height - 1) * 100}%) scale(${ratio}, ${ratio})`;
    }
    case ContainerFit.height: {
      const ratio = (c.height / p.height) / position.height;
      return `translate(${((c.left - p.left + c.width / 2) / p.width - 1) * 100}%, ${((c.top - p.top + c.height / 2) / p.height - 1) * 100}%) scale(${ratio}, ${ratio})`;
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
