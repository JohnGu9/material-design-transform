import React from "react";
import { useRefComposer } from "react-ref-composer";
import { createComponent, Curves, Duration, elevationBoxShadow, TagToElementType } from "./common";
import { AnimationState, Key, useOverlayTransform, useOverlayTransformLayout } from "./overlay-transform";
import { ContainerFit, ContainerTransformContextProps, Fit, useContainerTransformContext } from "./context";

export { ContainerFit, Fit };

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
      const innerRef = React.useRef<HTMLElement>(null);
      const isOpened = useOverlayTransform(keyId,
        ContainerTransformLayoutContext,
        () => {
          return {
            tag, container, mock, fit, containerFit,
            props: { style, ...props } as React.HTMLProps<HTMLElement>,
            element: innerRef.current!,
          };
        });

      return React.createElement(tag, {
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
  overlays: {} as { [key: Key]: Overlay | undefined; },
});

export type ContainerTransformLayoutProps = {
  keyId?: Key,
  overlayPosition?: Partial<OverlayPosition>,
  overlayStyle?: Omit<React.CSSProperties, 'left' | 'right' | 'top' | 'bottom' | 'width' | 'height' | 'transform'>,
  onScrimClick?: React.MouseEventHandler<HTMLDivElement>,
  willChangeDisable?: boolean,
  container?: React.ReactNode,  /* if [ContainerTransform]'s container not set */
} & ContainerTransformContextProps;

export const ContainerTransformLayout = buildContainerTransformLayout('div');

export function buildContainerTransformLayout<T extends keyof JSX.IntrinsicElements, Element = TagToElementType<T>>(tag: T) {
  return createComponent<Element, ContainerTransformLayoutProps>(
    function ({
      keyId,
      onScrimClick,
      willChangeDisable,
      overlayPosition,
      overlayStyle = defaultOverlayStyle,
      fit,
      container,
      containerFit,
      transitionStyle,
      children,
      style,
      ...props }, ref) {
      const composeRefs = useRefComposer();
      const innerRef = React.useRef<HTMLElement>(null);
      const overlays = React.useMemo(() => { return {} as { [key: Key]: Overlay; }; }, []);
      const context = useContainerTransformContext({ fit, containerFit, transitionStyle });
      const { overlay, animationState, onEnter, onEntered, onExited,
        keyId: currentKeyId } = useOverlayTransformLayout(keyId, getOverlay(keyId, overlays, context.fit, container, context.containerFit));
      const position = getPosition(overlayPosition);

      return React.createElement(tag, {
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
            transitionStyle={context.transitionStyle}
            onScrimClick={onScrimClick}
            onEnter={onEnter}
            onEntered={onEntered}
            onExited={onExited} />
          : <React.Fragment key={2} />,
      ]);
    }
  );
}

function Hero({
  overlay, animationState, innerRef, position, overlayStyle, willChangeDisable, transitionStyle,
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
    transitionStyle: keyof typeof ContainerTransformTransition,

    onScrimClick: React.MouseEventHandler<HTMLDivElement> | undefined,
    onEnter: () => void,
    onEntered: () => void,
    onExited: () => void,
  }) {
  function getExtendState(animationState: AnimationState) {
    switch (animationState) {
      case AnimationState.beforeEnter:
        return { overlayHide: false, isAnimating: true };
      case AnimationState.enter:
        return { overlayHide: true, isAnimating: true };
      case AnimationState.entered:
        return { overlayHide: true, isAnimating: false };
      case AnimationState.exit:
        return { overlayHide: false, isAnimating: true };
    }
  }
  const { overlayHide, isAnimating } = getExtendState(animationState);
  const willChange = willChangeDisable ? false : isAnimating;
  const child = overlay.element;
  const parent = innerRef.current!;

  const scrimRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const containerInnerRef = React.useRef<HTMLDivElement>(null);
  const rects = React.useMemo(() => {
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

  if (animationState === AnimationState.exit) {
    rects.childRect = child.getBoundingClientRect();
  }
  const { childRect, parentRect, currentRect } = rects;

  React.useEffect(() => {
    switch (animationState) {
      case AnimationState.beforeEnter: {
        rects.parentRect = parent.getBoundingClientRect();
        onEnter();
        break;
      }
      case AnimationState.exit: {
        const { current } = scrimRef;
        if (current) {
          const style = getComputedStyle(current);
          if (style.opacity === '0') onExited();
        }
        break;
      }
    }
  }, [animationState, parent, rects, onEnter, onExited]);

  React.useEffect(() => {
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
    const observer = new ResizeObserver(() => {
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
    };
  }, [rects, parent]);

  const transitionTemplate = ContainerTransformTransition[transitionStyle] ?? ContainerTransformTransition.M2;
  function getAnimationDuration() {
    switch (animationState) {
      case AnimationState.beforeEnter:
      case AnimationState.enter:
        return transitionTemplate.enterDuration;
      case AnimationState.entered:
      case AnimationState.exit:
        return transitionTemplate.exitDuration;
    }
  }
  const animationDuration = getAnimationDuration();
  type TransitionEndCallback = ((event: React.TransitionEvent<HTMLDivElement>) => unknown);
  function getTransitionEndCallback(): { scrimCallback?: TransitionEndCallback, containerCallback?: TransitionEndCallback; } {
    switch (animationState) {
      case AnimationState.enter:
        return {
          containerCallback: event => {
            if (event.target === containerRef.current && event.propertyName === 'transform') {
              onEntered();
            }
          }
        };
      case AnimationState.exit:
        return {
          scrimCallback: event => {
            if (event.target === scrimRef.current && event.propertyName === 'opacity') {
              onExited();
            }
          }
        };
    }
    return {};
  }
  const { scrimCallback, containerCallback } = getTransitionEndCallback();
  return (
    <>
      {/* scrim */}
      <div ref={scrimRef}
        style={{
          ...fullSizeStyle,
          backgroundColor: 'rgba(0, 0, 0, 0.32)',
          pointerEvents: overlayHide ? undefined : 'none',
          opacity: overlayHide ? 1 : 0,
          transition: getTransition(animationState, transitionTemplate.scrimEnterTransition, transitionTemplate.scrimExitTransition),
        }}
        onClick={onScrimClick}
        onTransitionEnd={scrimCallback} />
      {/* overlay */}
      {React.createElement(overlay.tag, {
        ...(overlay.props),
        ref: overlayRef,
        style: {
          ...overlay.props.style,
          ...centerStyle,
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          transitionProperty: isAnimating ? 'left, top, width, height, box-shadow, border-radius' : undefined,
          transitionDuration: isAnimating ? `${animationDuration}ms` : undefined,
          transitionTimingFunction: isAnimating ? transitionTemplate.curve : undefined,
          ...(overlayHide ? overlayStyleToStyle(overlayStyle, position) : relativeCenterPosition(childRect, parentRect)),
          willChange: willChange ? 'left, top, width, height, box-shadow, border-radius' : undefined,
        },
      }, <div
        style={{
          pointerEvents: overlayHide ? 'none' : undefined,
          opacity: overlayHide ? 0 : 1,
          transform: overlayHide ? mockTransform(childRect, parentRect, overlay.fit) : 'scale(1, 1)',
          transition: getTransition(animationState, transitionTemplate.overlayEnterTransition, transitionTemplate.overlayExitTransition),
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
          opacity: overlayHide ? 1 : 0,
          transform: overlayHide ? distTransform(position) : srcTransform(childRect, parentRect, position, overlay.containerFit),
          transition: getTransition(animationState, transitionTemplate.containerEnterTransition, transitionTemplate.containerExitTransition),
          willChange: willChange ? 'opacity, transform' : undefined,
        }}
        onTransitionEnd={containerCallback} >
        <div ref={containerInnerRef}
          style={{
            // outline: '1px solid red', 
            position: 'relative',
            overflow: 'hidden',
            transition: isAnimating ? `border-radius ${animationDuration}ms ${transitionTemplate.curve}` : undefined,
            pointerEvents: overlayHide ? 'auto' : undefined,
            borderRadius: overlayHide ? distBorderRadius(overlayStyle) : srcBorderRadius(child),
            ...(compensateSize(currentRect, parentRect, position, overlay.containerFit)),
            willChange: willChange ? containerWrapperWillChange(overlay.containerFit) : undefined,
          }}>
          {overlay.container}
        </div>
      </div>
    </>
  );
}

function getTransition(animationState: AnimationState, enterTransition: string, exitTransition: string) {
  switch (animationState) {
    case AnimationState.beforeEnter/* before enter */:
    case AnimationState.enter/* enter */: return enterTransition;
    case AnimationState.entered/* enter animation end */: return undefined;
    case AnimationState.exit/* exit */: return exitTransition;
  }
}

function getOverlay(keyId: Key | undefined, overlays: { [key: Key]: Overlay; }, fit: Fit, container: React.ReactNode, containerFit: ContainerFit) {
  if (keyId === undefined) return undefined;
  const overlay = overlays[keyId];
  if (overlay === undefined) return undefined;
  return {
    ...overlays[keyId],
    fit: overlay.fit ?? fit,
    container: overlay.container ?? container,
    containerFit: overlay.containerFit ?? containerFit,
  };
}

function scrimShowDuration(standardDuration: number) {
  return (standardDuration / 20 * 6).toFixed(0);
}

function enterOpacityTransition(standardDuration: number, standardCurve: string) {
  const segment = standardDuration / 20;
  return `opacity ${(segment * 4).toFixed(0)}ms ${standardCurve} ${(segment * 4).toFixed(0)}ms`;
}

function exitOpacityTransition(standardDuration: number, standardCurve: string) {
  const segment = standardDuration / 15;
  return `opacity ${(segment * 4).toFixed(0)}ms ${standardCurve} ${(segment * 3).toFixed(0)}ms`;
}

function buildNormalContainerTransformTransition(enterDuration: number, exitDuration: number, curve: string) {
  return {
    enterDuration,
    exitDuration,
    curve,

    scrimEnterTransition: `opacity ${scrimShowDuration(enterDuration)}ms ${curve}`,
    scrimExitTransition: `opacity ${exitDuration}ms ${curve}`,

    overlayEnterTransition: `${enterOpacityTransition(enterDuration, curve)}, transform ${enterDuration}ms ${curve}`,
    overlayExitTransition: `${exitOpacityTransition(exitDuration, curve)}, transform ${exitDuration}ms ${curve}`,

    containerEnterTransition: `${enterOpacityTransition(enterDuration, curve)}, transform ${enterDuration}ms ${curve}`,
    containerExitTransition: `${exitOpacityTransition(exitDuration, curve)}, transform ${exitDuration}ms ${curve}`,
  };
}

function outgoingOpacityTransitionFadeThroughVariant(standardDuration: number, standardCurve: string) {
  const segment = standardDuration / 20;
  return `opacity ${(segment * 6).toFixed(0)}ms ${standardCurve} 0ms`;
}

function incomingOpacityTransitionFadeThroughVariant(standardDuration: number, standardCurve: string) {
  const segment = standardDuration / 20;
  return `opacity ${(segment * 14).toFixed(0)}ms ${standardCurve} ${(segment * 6).toFixed(0)}ms`;
}

function buildFadeThroughVariantContainerTransformTransition(enterDuration: number, exitDuration: number, curve: { normal: string, decelerated: string, accelerated: string; }) {
  return {
    enterDuration,
    exitDuration,
    curve,

    scrimEnterTransition: `opacity ${scrimShowDuration(enterDuration)}ms ${curve.normal}`,
    scrimExitTransition: `opacity ${exitDuration}ms ${curve.normal}`,

    overlayEnterTransition: `${outgoingOpacityTransitionFadeThroughVariant(enterDuration, curve.decelerated)}, transform ${enterDuration}ms ${curve.normal}`,
    overlayExitTransition: `${incomingOpacityTransitionFadeThroughVariant(exitDuration, curve.accelerated)}, transform ${exitDuration}ms ${curve.normal}`,

    containerEnterTransition: `${incomingOpacityTransitionFadeThroughVariant(enterDuration, curve.accelerated)}, transform ${enterDuration}ms ${curve.normal}`,
    containerExitTransition: `${outgoingOpacityTransitionFadeThroughVariant(exitDuration, curve.decelerated)}, transform ${exitDuration}ms ${curve.normal}`,
  };
}

const M3Duration = Duration.M3["md.sys.motion.duration.long2"];

// reference: https://m2.material.io/design/motion/the-motion-system.html#container-transform
const ContainerTransformTransition = {
  M2: buildNormalContainerTransformTransition(300, 250, Curves.StandardEasing),
  M2FadeThroughVariant: buildFadeThroughVariantContainerTransformTransition(300, 250, { normal: Curves.StandardEasing, decelerated: Curves.Linear, accelerated: Curves.Linear }),
  M3: buildNormalContainerTransformTransition(M3Duration, M3Duration, Curves.M3.Emphasized),
  M3FadeThroughVariant: buildFadeThroughVariantContainerTransformTransition(M3Duration, M3Duration, { normal: Curves.M3.Emphasized, decelerated: Curves.M3.Linear, accelerated: Curves.M3.Linear }),
};

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
};

const centerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const defaultOverlayStyle = {
  boxShadow: elevationBoxShadow(24),
  borderRadius: 0,
};

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
