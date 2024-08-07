import { useEffect, useState } from 'react';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';

export const useSubject = <Type>(subject: BehaviorSubject<Type>, deps?: any): Type => {
  if (!subject) return null as unknown as Type;
  const subscriptionCleanup$ = new Subject<void>();
  const [value, setter] = useState<Type>(subject.value);

  useEffect(() => {
    subject.pipe(takeUntil(subscriptionCleanup$)).subscribe((value) => {
      setter(value);
    });

    return () => {
      subscriptionCleanup$.next();
    };
  }, [deps]);

  return value;
};
