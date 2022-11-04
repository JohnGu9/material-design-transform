import { createContext, createElement, CSSProperties, Fragment, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRefComposer } from "react-ref-composer";
import { createComponent, Curves, TagToElementType } from "./common";

type Key = string | number | symbol;
export type ContainerTransformProps = {
  keyId: Key,
  container?: React.ReactNode,
};

export const ContainerTransform = buildContainerTransform('div');

export function buildContainerTransform<T extends keyof JSX.IntrinsicElements, Element = TagToElementType<T>>(tag: T) {
  return createComponent<Element, ContainerTransformProps>(
    function ({ keyId, container, style, ...props }, ref) {
      const composeRefs = useRefComposer();
      const innerRef = useRef<HTMLElement>(null);
      const context = useContext(ContainerTransformLayoutContext);
      const { overlays } = context;
      const isOpened = context.keyId === keyId;

      const overlay = overlays[keyId];
      if (overlay !== undefined) {
        overlay.container = container;
        overlay.props = { style, ...props } as React.HTMLProps<HTMLElement>;
      }

      useEffect(() => {
        const overlay = overlays[keyId];
        if (overlay !== undefined) throw Error(`keyId[${String(keyId)}] can't be reused under same ContainerTransformLayout`);
        overlays[keyId] = {
          tag, container,
          props: { style, ...props } as React.HTMLProps<HTMLElement>,
          element: innerRef.current!,
        };
        return () => { overlays[keyId] = undefined; }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [keyId, overlays]);

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

type AnimationState = boolean | undefined;
type Overlay = { tag: string, props: React.HTMLProps<HTMLElement>, element: HTMLElement, container: React.ReactNode };

const ContainerTransformLayoutContext = createContext({
  keyId: undefined as Key | undefined,
  overlays: {} as { [key: Key]: Overlay | undefined },
});

export type ContainerTransformLayoutProps = {
  keyId?: Key,
  overlayStyle?: CSSProperties,
  onScrimClick?: React.MouseEventHandler<HTMLDivElement>,
};

export const ContainerTransformLayout = buildContainerTransformLayout('div');

export function buildContainerTransformLayout<T extends keyof JSX.IntrinsicElements, Element = TagToElementType<T>>(tag: T) {
  return createComponent<Element, ContainerTransformLayoutProps>(
    function ({
      keyId,
      onScrimClick,
      overlayStyle = defaultOverlayStyle,
      children,
      style,
      ...props }, ref) {
      const state = useMemo(() => {
        return {
          keyId: undefined as Key | undefined,
          animationState: undefined as AnimationState,
          overlays: {} as { [key: Key]: Overlay },
        };
      }, []);
      const composeRefs = useRefComposer();
      const innerRef = useRef<HTMLElement>(null);
      const scrimRef = useRef<HTMLDivElement>(null);
      const overlayRef = useRef<HTMLElement>(null);
      const originRef = useRef<HTMLDivElement>(null);
      const containerRef = useRef<HTMLDivElement>(null);
      const [, setTicker] = useState(false);
      const notifyUpdate = () => { setTicker(value => !value); };

      if (state.keyId !== undefined) {
        if (state.keyId !== keyId) {
          state.animationState = false;
        } else { // state.keyId === keyId
          if (state.animationState === false)
            state.animationState = true;
        }
      }

      const overlay = state.keyId !== undefined ? state.overlays[state.keyId] : undefined;
      const hasOverlay = overlay !== undefined;
      const overlayShow = state.animationState === true;

      useEffect(() => {
        if (state.keyId === undefined && keyId !== undefined) {
          state.keyId = keyId;
          notifyUpdate();
        }
      }, [keyId, state.keyId, state]);

      useEffect(() => {
        if (hasOverlay) {
          scrimRef.current?.getBoundingClientRect();
          overlayRef.current?.getBoundingClientRect();
          originRef.current?.getBoundingClientRect();
          containerRef.current?.getBoundingClientRect();
          state.animationState = true;
          notifyUpdate();
        }
      }, [hasOverlay, state.keyId, state]);

      return createElement(tag, {
        style: { position: 'relative', ...style },
        ref: composeRefs(innerRef, ref),
        ...props,
      }, [
        <ContainerTransformLayoutContext.Provider
          key={0}
          value={{
            keyId: state.keyId,
            overlays: state.overlays,
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
            onTransitionEnd={state.animationState === false
              ? event => {
                if (event.target === scrimRef.current && event.propertyName === 'opacity') {
                  state.keyId = undefined;
                  state.animationState = undefined;
                  notifyUpdate();
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
              transition: overlayTransition,
              ...(overlayShow
                ? overlayStyle
                : relativeCenterPosition(overlay.element, innerRef.current!)),
            },
          }, [
            <div key={0}
              ref={originRef}
              style={{
                ...fullSizeStyle,
                ...centerStyle,
                pointerEvents: overlayShow ? 'none' : undefined,
                opacity: overlayShow ? 0 : 1,
                transition: overlayShow ? 'opacity 60ms linear 60ms' : 'opacity 133ms linear 117ms',
              }}>
              {overlay.props.children}
            </div>,
            <div key={1}
              ref={containerRef}
              style={{
                ...fullSizeStyle,
                ...centerStyle,
                pointerEvents: overlayShow ? undefined : 'none',
                opacity: overlayShow ? 1 : 0,
                transition: overlayShow ? 'opacity 120ms linear 125ms' : 'opacity 50ms linear 67ms',
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
  inset: 0,
}

const centerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const overlayTransition = `left 250ms ${Curves.StandardEasing}, top 250ms ${Curves.StandardEasing}, width 250ms ${Curves.StandardEasing}, height 250ms ${Curves.StandardEasing}, box-shadow 250ms ${Curves.StandardEasing}, border-radius 250ms ${Curves.StandardEasing}`;

const defaultOverlayStyle: React.CSSProperties = {
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  boxShadow: '0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12)',
  borderRadius: 0,
}

function relativeCenterPosition(child: HTMLElement, parent: HTMLElement): React.CSSProperties {
  const c = child.getBoundingClientRect();
  const p = parent.getBoundingClientRect();

  return {
    left: c.left - p.left,
    top: c.top - p.top,
    width: c.width,
    height: c.height,
    willChange: 'left, top, width, height, boxShadow, borderRadius',
  };
}

