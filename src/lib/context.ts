import React from "react";

export enum SharedAxisTransform {
    /* y-axis */
    fromBottomToTop,
    fromTopToBottom,
    /* x-axis */
    fromLeftToRight,
    fromRightToLeft,
    /* z-axis */
    fromFrontToBack,
    fromBackToFront,
};
export type SharedAxisContextProps = {
    transitionStyle?: "M2" | "M3";
    transform?: SharedAxisTransform;
    unit?: "px" | "dp",// for slide movement, "px" from legacy, "dp" from modern
};

export type FadeThroughContextProps = {
    transitionStyle?: "M2" | "M3",
};

export enum Fit { width, height, both, originSize };
export enum ContainerFit { width, height, both };
export type ContainerTransformContextProps = {
    transitionStyle?: "M2" | "M3" | "M2FadeThroughVariant" | "M3FadeThroughVariant",
    fit?: Fit,
    containerFit?: ContainerFit,
};

export type MaterialDesignTransformContextType = {
    transitionStyle: "M2" | "M3",
    sharedAxis?: SharedAxisContextProps,
    fadeThrough?: FadeThroughContextProps;
    containerTransform?: ContainerTransformContextProps;
};

export const MaterialDesignTransformContext = React.createContext<MaterialDesignTransformContextType>({
    transitionStyle: "M2",
});

export function useSharedAxisContext(props: SharedAxisContextProps) {
    const { transitionStyle, sharedAxis } = React.useContext(MaterialDesignTransformContext);
    return {
        transitionStyle: props.transitionStyle ?? sharedAxis?.transitionStyle ?? transitionStyle,
        transform: props.transform ?? sharedAxis?.transform ?? SharedAxisTransform.fromBottomToTop,
        unit: props.unit ?? sharedAxis?.unit ?? "px",
    };
}

export function useFadeThroughContext(props: FadeThroughContextProps) {
    const { transitionStyle, fadeThrough } = React.useContext(MaterialDesignTransformContext);
    return {
        transitionStyle: props.transitionStyle ?? fadeThrough?.transitionStyle ?? transitionStyle,
    };
}

export function useContainerTransformContext(props: ContainerTransformContextProps) {
    const { transitionStyle, containerTransform } = React.useContext(MaterialDesignTransformContext);
    return {
        transitionStyle: props.transitionStyle ?? containerTransform?.transitionStyle ?? transitionStyle,
        fit: props.fit ?? containerTransform?.fit ?? Fit.originSize,
        containerFit: props.containerFit ?? containerTransform?.containerFit ?? ContainerFit.width,
    };
}
