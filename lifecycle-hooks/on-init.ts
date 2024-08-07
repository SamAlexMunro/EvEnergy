import { useEffect } from 'react';

export const onInit = (callback: Function) => {
  useEffect(() => callback(), []);
};
