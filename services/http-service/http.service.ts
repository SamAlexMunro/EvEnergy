import { BehaviorSubject } from 'rxjs';

/**
 * HTTPService Wrapper allows us to encapsulate standardised logic
 * around HTTP requests, this can be further augmented or used as a template
 * if working with a bespoke internal BE service that has specific needs and responses
 */
export class HttpService {
  error$ = new BehaviorSubject({ error: '' });
  loading$ = new BehaviorSubject(false);

  async get() {}

  /**
   * Example methods if we are building out a fully fledged HTTPService
   */
  post() {}

  put() {}

  update() {}
}