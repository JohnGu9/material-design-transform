import { Context, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Key = string | number | symbol;
export type AnimationState = true /* enter */ | false /* exit */ | undefined /* before enter */ | null /* enter animation end */;
export type Overlays<Overlay> = { [key: Key]: Overlay | undefined };
export type OverlayTransformContext<Overlay> = {
  keyId: Key | undefined,
  overlays: Overlays<Overlay>,
}

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
    state.animationState = true;
    notifyUpdate();
  }, [state]);
  const onEntered = useCallback(() => {
    state.animationState = null;
    notifyUpdate();
  }, [state]);
  const onExited = useCallback(() => {
    state.keyId = undefined;
    state.overlay = undefined;
    state.animationState = undefined;
    notifyUpdate();
  }, [state]);

  if (state.keyId !== undefined) {
    if (state.keyId !== keyId) {
      state.animationState = false;
    } else { // state.keyId === keyId
      if (state.animationState === false)
        state.animationState = true;
    }
  }
  if (state.animationState !== false && state.keyId !== undefined) {
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
    animationState: undefined as AnimationState,
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
    return () => { overlays[keyId] = undefined; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyId, overlays]);

  return contextKeyId === keyId;
}
