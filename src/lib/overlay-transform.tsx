import { Context, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Key = string | number | symbol;
// export type AnimationState = true /* enter */ | false /* exit */ | undefined /* before enter */ | null /* enter animation end */;
export enum AnimationState {
  beforeEnter,
  enter,
  entered,
  exit,
};
export type Overlays<Overlay> = { [key: Key]: Overlay | undefined; };
export type OverlayTransformContext<Overlay> = {
  keyId: Key | undefined,
  overlays: Overlays<Overlay>,
};

export function useOverlayTransformLayout<Overlay extends object>(
  keyId: Key | undefined,
  overlay: Overlay | undefined) {
  const state = useMemo<{
    keyId: Key | undefined;
    overlay: Overlay | undefined;
    animationState: AnimationState;
  }>(buildState, []);
  const [, setTicker] = useState(false);
  const notifyUpdate = () => { setTicker(value => !value); };
  const onEnter = useCallback(() => {
    state.animationState = AnimationState.enter;
    notifyUpdate();
  }, [state]);
  const onEntered = useCallback(() => {
    state.animationState = AnimationState.entered;
    notifyUpdate();
  }, [state]);
  const onExited = useCallback(() => {
    state.keyId = undefined;
    state.overlay = undefined;
    state.animationState = AnimationState.beforeEnter;
    notifyUpdate();
  }, [state]);

  if (state.keyId !== undefined) {
    if (state.keyId !== keyId) {
      state.animationState = AnimationState.exit;
    } else { // state.keyId === keyId
      if (state.animationState === AnimationState.exit)
        state.animationState = AnimationState.enter;
    }
  }
  if (state.animationState !== AnimationState.exit && state.keyId !== undefined) {
    state.overlay = overlay;
  }

  useEffect(() => {
    if (state.keyId === undefined && keyId !== undefined) {
      state.keyId = keyId;
      notifyUpdate();
    }
  }, [keyId, state.keyId, state]);

  return {
    ...state,
    onEnter,
    onEntered,
    onExited,
  };
}

function buildState<KeyId, Overlay>() {
  return {
    keyId: undefined as KeyId | undefined,
    overlay: undefined as Overlay | undefined,
    animationState: AnimationState.beforeEnter,
  };
}

export function useOverlayTransform<Overlay extends object>(
  keyId: Key,
  overlayTransformContext: Context<OverlayTransformContext<Overlay>>,
  buildOverlay: () => Overlay) {
  const { overlays, keyId: contextKeyId } = useContext(overlayTransformContext);

  const overlay = overlays[keyId];
  if (overlay !== undefined) {
    Object.assign(overlay, buildOverlay());
  }

  useEffect(() => {
    const overlay = overlays[keyId];
    if (overlay !== undefined) throw Error(`keyId[${String(keyId)}] can't be reused under same ContainerTransformLayout`);
    overlays[keyId] = buildOverlay();
    return () => { overlays[keyId] = undefined; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyId, overlays]);

  return contextKeyId === keyId;
}
