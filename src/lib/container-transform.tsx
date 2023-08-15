import React, { createElement, Fragment, useEffect, useMemo, useRef } from "react";
import { useRefComposer } from "react-ref-composer";
import { createComponent, Curves, elevationBoxShadow, TagToElementType } from "./common";
import { AnimationState, Key, useOverlayTransform, useOverlayTransformLayout } from "./overlay-transform";

export enum Fit { width, height, both, originSize };
export enum ContainerFit { width, height, both };

export type ContainerTransformProps = {
  keyId: Key,
  mock?: React.ReactNode,
  fit?: Fit,
  container?: React.ReactNode,
  containerFit?: ContainerFit,
};

export const ContainerTransform = buildContainerTransform('div');

export function buildContainerTransform<T extends keyof JSX.IntrinsicElements, Element = TagToElementType<T>>(tag: T) {
  return createComponent<Element, ContainerTransformProps>(
    function ({
      keyId,
      mock,
      fit,
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
            tag, container, mock, fit, containerFit,
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
  centerY: number, /* default: 0.5, 0.5 mean center */
  width: number,   /* default: 1, 1 mean full width */
  height: number,  /* default: 1, 1 mean full height */
};

export type Overlay = {
  tag: string, props: React.HTMLProps<HTMLElement>, element: HTMLElement,
  mock?: React.ReactNode,
  fit?: Fit,
  container?: React.ReactNode,
  containerFit?: ContainerFit,
};

export const ContainerTransformLayoutContext = React.createContext({
  keyId: undefined as Key | undefined,
  overlays: {} as { [key: Key]: Overlay | undefined },
});

export type ContainerTransformLayoutProps = {
  keyId?: Key,
  overlayPosition?: Partial<OverlayPosition>,
  overlayStyle?: Omit<React.CSSProperties, 'left' | 'right' | 'top' | 'bottom' | 'width' | 'height' | 'transform'>,
  onScrimClick?: React.MouseEventHandler<HTMLDivElement>,
  willChangeDisable?: boolean,
  fit?: Fit,
  container?: React.ReactNode,  /* if [ContainerTransform]'s container not set */
  containerFit?: ContainerFit,  /* if [ContainerTransform]'s containerFit not set */
};

export const ContainerTransformLayout = buildContainerTransformLayout('div');

export function buildContainerTransformLayout<T extends keyof JSX.IntrinsicElements, Element = TagToElementType<T>>(tag: T) {
  return createComponent<Element, ContainerTransformLayoutProps>(
    function ({
      keyId,
      onScrimClick,
      willChangeDisable,
      overlayPosition,
      overlayStyle = defaultOverlayStyle,
      fit = Fit.originSize,
      container,
      containerFit = ContainerFit.width,
      children,
      style,
      ...props }, ref) {
      const composeRefs = useRefComposer();
      const innerRef = useRef<HTMLElement>(null);
      const overlays = useMemo(() => { return {} as { [key: Key]: Overlay }; }, []);
      const { overlay, animationState, onEnter, onEntered, onExited,
        keyId: currentKeyId } = useOverlayTransformLayout(keyId, getOverlay(keyId, overlays, fit, container, containerFit));
      const position = getPosition(overlayPosition);

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
        overlay !== undefined
          ? <Hero key={1}
            overlay={overlay}
            animationState={animationState}
            innerRef={innerRef}
            position={position}
            overlayStyle={overlayStyle}
            willChangeDisable={willChangeDisable}
            onScrimClick={onScrimClick}
            onEnter={onEnter}
            onEntered={onEntered}
            onExited={onExited} />
          : <Fragment key={2} />,
      ]);
    }
  );
}

function Hero({
  overlay, animationState, innerRef, position, overlayStyle, willChangeDisable,
  onScrimClick, onEnter, onEntered, onExited }: {
    overlay: {
      fit: Fit;
      container: React.ReactNode;
      containerFit: ContainerFit;
      tag: string;
      props: React.HTMLProps<HTMLElement>;
      element: HTMLElement;
      mock?: React.ReactNode;
    },
    animationState: AnimationState,
    innerRef: React.RefObject<HTMLElement>,
    position: OverlayPosition,
    overlayStyle: Omit<React.CSSProperties, 'left' | 'right' | 'top' | 'bottom' | 'width' | 'height' | 'transform'>,
    willChangeDisable: boolean | undefined,

    onScrimClick: React.MouseEventHandler<HTMLDivElement> | undefined,
    onEnter: () => void,
    onEntered: () => void,
    onExited: () => void,
  }) {
  const overlayShow = animationState === true || animationState === null;
  const isAnimating = animationState !== null;
  const willChange = willChangeDisable ? false : isAnimating;
  const child = overlay.element;
  const parent = innerRef.current!;

  const scrimRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerInnerRef = useRef<HTMLDivElement>(null);
  const rects = useMemo(() => {
    const childRect = child.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    return {
      childRect, parentRect,
      currentRect: childRect,
      position, overlay
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child, parent]);
  rects.position = position;
  rects.overlay = overlay;

  if (animationState === false) {
    rects.childRect = child.getBoundingClientRect();
  }
  const { childRect, parentRect, currentRect } = rects;

  useEffect(() => {
    switch (animationState) {
      case undefined: {
        rects.parentRect = parent.getBoundingClientRect();
        onEnter();
        break;
      }
      case false: {
        const { current } = scrimRef;
        if (current) {
          const style = getComputedStyle(current);
          if (style.opacity === '0') onExited();
        }
        break;
      }
    }
  }, [animationState, parent, rects, onEnter, onExited]);

  useEffect(() => {
    const current = containerInnerRef.current!;
    const update = () => {
      const { overlay: { containerFit }, currentRect, parentRect, position } = rects;
      switch (containerFit) {
        case ContainerFit.both: {
          break;
        }
        case ContainerFit.height: {
          const { width } = compensateSize(currentRect, parentRect, position, containerFit);
          current.style.width = width;
          break;
        }
        case ContainerFit.width: {
          const { height } = compensateSize(currentRect, parentRect, position, containerFit);
          current.style.height = height;
          break;
        }
      }
    };
    const observer = new ResizeObserver((_) => {
      // entries do not contain position information (DomRect without x / y)
      // so call [getBoundingClientRect] to get DomRect without position information 
      rects.parentRect = parent.getBoundingClientRect();
      update();
    });
    const overlayObserver = new ResizeObserver(([entry]) => {
      rects.currentRect = entry.contentRect; // currentRect not require position information
      update();
    });
    observer.observe(parent);
    overlayObserver.observe(overlayRef.current!);
    return () => {
      observer.disconnect();
      overlayObserver.disconnect();
    }
  }, [rects, parent]);

  return (
    <>
      {/* scrim */}
      <div ref={scrimRef}
        style={{
          ...fullSizeStyle,
          backgroundColor: 'rgba(0, 0, 0, 0.32)',
          pointerEvents: overlayShow ? undefined : 'none',
          opacity: overlayShow ? 1 : 0,
          transition: selectTransition(animationState, scrimShowTransition, scrimHiddenTransition),
        }}
        onClick={onScrimClick}
        onTransitionEnd={animationState === false
          ? event => {
            if (event.target === scrimRef.current && event.propertyName === 'opacity') {
              onExited();
            }
          }
          : undefined} />
      {/* overlay */}
      {createElement(overlay.tag, {
        ...(overlay.props),
        ref: overlayRef,
        style: {
          ...overlay.props.style,
          ...centerStyle,
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          transitionProperty: isAnimating ? 'left, top, width, height, box-shadow, border-radius' : undefined,
          transitionDuration: isAnimating ? '250ms' : undefined,
          transitionTimingFunction: isAnimating ? Curves.StandardEasing : undefined,
          ...(overlayShow ? overlayStyleToStyle(overlayStyle, position) : relativeCenterPosition(childRect, parentRect)),
          willChange: willChange ? 'left, top, width, height, box-shadow, border-radius' : undefined,
        },
      }, <div
        style={{
          pointerEvents: overlayShow ? 'none' : undefined,
          opacity: overlayShow ? 0 : 1,
          transform: overlayShow ? mockTransform(childRect, parentRect, overlay.fit) : 'scale(1, 1)',
          transition: selectTransition(animationState, overlayShowTransition, overlayHiddenTransition),
          willChange: willChange ? 'opacity, transform' : undefined,
        }}>
        {overlay.mock ?? overlay.props.children}
      </div>)}
      {/* container */}
      <div ref={containerRef}
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
          transform: overlayShow ? distTransform(position) : srcTransform(childRect, parentRect, position, overlay.containerFit),
          transition: selectTransition(animationState, containerShowTransition, containerHiddenTransition),
          willChange: willChange ? 'opacity, transform' : undefined,
        }}
        onTransitionEnd={animationState === true
          ? event => {
            if (event.target === containerRef.current && event.propertyName === 'opacity') {
              onEntered();
            }
          }
          : undefined} >
        <div ref={containerInnerRef}
          style={{
            // outline: '1px solid red', 
            position: 'relative',
            overflow: 'hidden',
            transition: isAnimating ? `border-radius 250ms ${Curves.StandardEasing}` : undefined,
            pointerEvents: overlayShow ? 'auto' : undefined,
            borderRadius: overlayShow ? distBorderRadius(overlayStyle) : srcBorderRadius(child),
            ...(compensateSize(currentRect, parentRect, position, overlay.containerFit)),
            willChange: willChange ? containerWrapperWillChange(overlay.containerFit) : undefined,
          }}>
          {overlay.container}
        </div>
      </div>
    </>
  );
}

function selectTransition(animationState: AnimationState, openTransition: string, closeTransition: string) {
  switch (animationState) {
    case undefined:
    case true: return openTransition;
    case null: return undefined;
    case false: return closeTransition;
  }
}

function getOverlay(keyId: Key | undefined, overlays: { [key: Key]: Overlay }, fit: Fit, container: React.ReactNode, containerFit: ContainerFit) {
  if (keyId === undefined) return undefined;
  const overlay = overlays[keyId];
  if (overlay === undefined) return undefined;
  return {
    ...overlays[keyId],
    fit: overlay.fit ?? fit,
    container: overlay.container ?? container,
    containerFit: overlay.containerFit ?? containerFit,
  }
}
const scrimShowTransition = `opacity 90ms ${Curves.Easing(0, 0)}`;
const scrimHiddenTransition = `opacity 250ms ${Curves.StandardEasing}`;

const overlayShowTransition = buildTransition('opacity 60ms linear 60ms', ['transform'], '250ms', Curves.StandardEasing);
const overlayHiddenTransition = buildTransition('opacity 133ms linear 117ms', ['transform'], '250ms', Curves.StandardEasing);

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

function relativeCenterPosition(c: DOMRect, p: DOMRect): React.CSSProperties {
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

function srcTransform(c: DOMRect, p: DOMRect, position: OverlayPosition, containerFit: ContainerFit) {
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

function compensateSize(c: DOMRect, p: DOMRect, position: OverlayPosition, containerFit: ContainerFit) {
  switch (containerFit) {
    case ContainerFit.both:
      return {
        width: `${position.width * 100}%`,
        height: `${position.height * 100}%`,
      };
    case ContainerFit.height: {
      const srcRatio = c.width / c.height;
      const distRatio = (p.width * position.width) / (p.height * position.height);
      return {
        width: `${position.width * srcRatio / distRatio * 100}%`,
        height: `${position.height * 100}%`,
      };
    }
    case ContainerFit.width: {
      const srcRatio = c.width / c.height;
      const distRatio = (p.width * position.width) / (p.height * position.height);
      return {
        width: `${position.width * 100}%`,
        height: `${position.height * distRatio / srcRatio * 100}%`,
      };
    }
  }
}

function containerWrapperWillChange(containerFit: ContainerFit) {
  switch (containerFit) {
    case ContainerFit.both:
      return 'border-radius';
    case ContainerFit.height:
      return 'width, border-radius';
    case ContainerFit.width:
      return 'height, border-radius';
  }
}

function srcBorderRadius(child: HTMLElement) {
  const s = getComputedStyle(child);
  return s.borderRadius;
}

function distBorderRadius(css: React.CSSProperties) {
  return css?.borderRadius;
}

function mockTransform(c: DOMRect, p: DOMRect, fit: Fit) {
  switch (fit) {
    case Fit.originSize:
      return 'scale(1, 1)';
    case Fit.both: {
      return `scale(${p.width / c.width}, ${p.height / c.height})`;
    }
    case Fit.height: {
      const scale = p.height / c.height;
      return `scale(${scale}, ${scale})`;
    }
    case Fit.width: {
      const scale = p.width / c.width;
      return `scale(${scale}, ${scale})`;
    }
  }
}
