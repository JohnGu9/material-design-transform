import React, { createElement, CSSProperties, Fragment, useEffect, useMemo, useRef } from "react";
import { useRefComposer } from "react-ref-composer";
import { createComponent, Curves, TagToElementType } from "./common";
import { ContainerTransformLayoutContext, Overlay } from "./container-transform";
import { Key, useOverlayTransformLayout } from "./overlay-transform";

export type ContainerTransformLayoutProps = {
  keyId?: Key,
  overlayStyle?: CSSProperties,
  overlayTransitionProperty?: string,
  onScrimClick?: React.MouseEventHandler<HTMLDivElement>,
};

export const ContainerTransformLayout = buildContainerTransformLayout('div');

export function buildContainerTransformLayout<T extends keyof JSX.IntrinsicElements, Element = TagToElementType<T>>(tag: T) {
  return createComponent<Element, ContainerTransformLayoutProps>(
    function ({
      keyId,
      onScrimClick,
      overlayStyle = defaultOverlayStyle,
      overlayTransitionProperty = 'left, right, top, bottom, width, height, box-shadow, border-radius',
      children,
      style,
      ...props }, ref) {
      const composeRefs = useRefComposer();
      const innerRef = useRef<HTMLElement>(null);
      const scrimRef = useRef<HTMLDivElement>(null);
      const overlayRef = useRef<HTMLElement>(null);
      const originRef = useRef<HTMLDivElement>(null);
      const containerRef = useRef<HTMLDivElement>(null);
      const overlays = useMemo(() => { return {} as { [key: Key]: Overlay }; }, []);
      const state = useOverlayTransformLayout(keyId, overlays);
      const { overlay, animationState, onEnter, onExited } = state;

      const hasOverlay = overlay !== undefined;
      const overlayShow = animationState === true;

      useEffect(() => {
        if (hasOverlay) {
          scrimRef.current?.getBoundingClientRect();
          overlayRef.current?.getBoundingClientRect();
          originRef.current?.getBoundingClientRect();
          containerRef.current?.getBoundingClientRect();
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
            keyId: state.keyId,
            overlays: overlays,
          }}>
          {children}
        </ContainerTransformLayoutContext.Provider>,
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
        hasOverlay
          ? createElement(overlay.tag, {
            ...(overlay.props),
            key: 2,
            ref: overlayRef,
            style: {
              ...overlay.props.style,
              position: 'absolute',
              transitionProperty: overlayTransitionProperty,
              transitionDuration: '250ms',
              transitionTimingFunction: Curves.StandardEasing,
              ...(overlayShow
                ? overlayStyle
                : relativeCenterPosition(
                  overlay.element,
                  innerRef.current!,
                  overlayStyle,
                  overlayTransitionProperty)),
            },
          }, [
            <div key={0}
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
            </div>,
            <div key={1}
              ref={containerRef}
              style={{
                ...fullSizeStyle,
                pointerEvents: overlayShow ? undefined : 'none',
                opacity: overlayShow ? 1 : 0,
                transition: overlayShow
                  ? 'opacity 120ms linear 125ms'
                  : 'opacity 50ms linear 67ms',
              }}>
              {overlay.container}
            </div>
          ])
          : <Fragment key={2} />,
      ]);
    }
  );
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

const defaultOverlayStyle: React.CSSProperties = {
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  boxShadow: '0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12)',
  borderRadius: 0,
}

function relativeCenterPosition(child: HTMLElement, parent: HTMLElement, overlayStyle: React.CSSProperties, transitionProperty: string): React.CSSProperties {
  const c = child.getBoundingClientRect();
  const p = parent.getBoundingClientRect();
  return {
    left: 'left' in overlayStyle ? c.left - p.left : undefined,
    top: 'top' in overlayStyle ? c.top - p.top : undefined,
    right: 'right' in overlayStyle ? p.right - c.right : undefined,
    bottom: 'bottom' in overlayStyle ? p.bottom - c.bottom : undefined,
    width: 'width' in overlayStyle ? c.width : undefined,
    height: 'height' in overlayStyle ? c.height : undefined,
    willChange: transitionProperty,
  };
}

