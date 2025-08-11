import {AuthInvalidCredentialsError, ServerError} from './Errors.ts'
import {UrlHelper} from './urlHelper.ts'

export interface IRequestOptions {
  getToken: () => string | null;
  setToken: (token: string) => void;
  onAuthError: () => void;
  getAccountId: () => number | undefined;
  getAccountToken: () => string | null;
}

export interface IRequestCustomConfig {
  isFullUrl?: boolean;
  useAccountId?: boolean;
}
export class BaseRequest {
  static globalOptions: IRequestOptions

  constructor(protected baseUrl: string) {
  }

  protected get options(): IRequestOptions {
    return (
      BaseRequest.globalOptions || {
        getToken: (): string | null => null,
        onAuthError: (): void => console.warn('onAuthError is not set'),
      }
    )
  }

  protected addTokenToHeaders(headers: any): any {
    const userToken = this.options.getToken()

    if (userToken != null) {
      return {Authorization: `Bearer ${userToken}`, ...headers}
    } else {
      return headers
    }
  }

  protected async fetch(url: string, config: any, customConfig?: IRequestCustomConfig): Promise<any> {
    let status: number | null = null

    try {
      const basicHeaders = this.addTokenToHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': false,
      })
      config.headers = Object.assign({}, basicHeaders, config.headers ?? {})
      const requestUrl = customConfig?.isFullUrl === true ? url : this.createUrl(url)

      const response = await fetch(requestUrl, config)

      status = response.status
      if (status === 401) {
        this.options.onAuthError()

        throw new AuthInvalidCredentialsError()
      } else if (!status || status < 200 || status >= 300) {
        throw new ServerError()
      }

      return response
    } catch (error) {
      if (error instanceof ServerError) {
        console.warn(error, 'Request error', {url, status})
      }
      throw error
    }
  }

  protected createUrl(relativeUrl: string): string {
    return UrlHelper.create(relativeUrl, this.baseUrl)
  }


  protected objectToQueryString(params: Record<string, any>): string {
    let queryString = ''

    if (params) {
      queryString = Object.keys(params)
        .filter(k => params[k] != null)
        .map(k => {
          if (Array.isArray(params[k])) {
            return params[k]
              .filter((v: any) => v != null)
              .map((v: any) => `${k}${encodeURIComponent('[]')}=${encodeURIComponent(v)}`)
              .join('&')
          }

          return `${k}=${encodeURIComponent(params[k])}`
        })
        .join('&')
    }

    return queryString
  }
}
