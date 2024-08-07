import React, { ReactNode } from 'react';

export interface NgIfProperties {
  condition:
    | ((...args: any) => void)
    | JSX.Element
    | JSX.Element[]
    | ReactNode
    | object
    | boolean
    | null
    | number
    | number[]
    | string
    | undefined;
  children?: ReactNode;
}

export const If = ({ children, condition }: NgIfProperties): JSX.Element => {
  return <>{condition ? <>{children}</> : null}</>;
};
