# MaterialDesignTransform

## Introduce

This component provide material design(v2) transform for html element under `react-dom` framework.

## Feature

1. SharedAxis.
2. FadeThrough.

## Install

```console
npm i material-design-transform
```

## Import

```jsx
import { SharedAxis, SharedAxisTransform } from "material-design-transform";

import { FadeThrough } from "material-design-transform";
```

## Use

```jsx
const [id, setId] = React.useState(0);

<SharedAxis transform={SharedAxisTransform.fromTopToBottom} keyId={id}>
  {children}
</SharedAxis>;

<FadeThrough keyId={id}>{children}</FadeThrough>;
```

## Property: keyId

Change [keyId]() to toggle switch animation.

## Alarm

Switch animation state toggle by properties changing and transitionend event of opacity. If opacity animate to 0 and toggle transitionend event that mean exit animation end. And if opacity animate to 1 and toggle transitionend event that mean enter animation end. Break transitionend event of opacity may break the component function.

## Container transform

Developing...

## Material Design v3

Waiting google release precise motion guide.

## Component dependencies

- react-dom
- react-ref-composer

## Issue report

https://github.com/JohnGu9/MaterialDesignTransform/issues

## LICENSE

[MIT](./LICENSE)
