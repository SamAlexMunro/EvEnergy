import { BehaviorSubject } from 'rxjs';

export enum Method {
  POST = 'POST',
  PUT = 'PUT',
  GET = 'GET',
}
/**
 * HTTPService Wrapper allows us to encapsulate standardised logic
 * around HTTP requests, this can be further augmented or used as a template
 * if working with a bespoke internal BE service that has specific needs and responses.
 */
export class HttpService {
  readonly error$ = new BehaviorSubject('');
  readonly loading$ = new BehaviorSubject(false);

  async get<Type>({ url, configurationOptions }: { url: string; configurationOptions?: {} }): Promise<Type> {
    this.setSubjectDefaultStates();

    return fetch(url, configurationOptions)
      .then((response) => response.json())
      .catch((error) => this.error$.next(error))
      .finally(() => this.loading$.next(false));
  }

  async post<Type>({
    url,
    body,
    configurationOptions,
  }: {
    url: string;
    body: {};
    configurationOptions?: {};
  }): Promise<Type> {
    this.setSubjectDefaultStates();

    return fetch(url, { method: Method.POST, body: JSON.stringify(body), ...configurationOptions })
      .then((response) => response.json())
      .catch((error) => this.error$.next(error))
      .finally(() => this.loading$.next(false));
  }

  async put<Type>({
    url,
    body,
    configurationOptions,
  }: {
    url: string;
    body: {};
    configurationOptions?: {};
  }): Promise<Type> {
    this.setSubjectDefaultStates();

    return fetch(url, { method: Method.PUT, body: JSON.stringify(body), ...configurationOptions })
      .then((response) => response.json())
      .catch((error) => this.error$.next(error))
      .finally(() => this.loading$.next(false));
  }

  private setSubjectDefaultStates() {
    this.loading$.next(true);
    this.error$.next('');
  }
}
