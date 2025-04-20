
// Chrome extension type declarations
declare namespace chrome {
  export namespace tabs {
    export function query(queryInfo: any, callback: (tabs: chrome.tabs.Tab[]) => void): void;
    export function sendMessage(tabId: number, message: any, callback?: (response: any) => void): void;
    
    export interface Tab {
      id?: number;
      url?: string;
      active: boolean;
      currentWindow: boolean;
    }
  }
  
  export namespace runtime {
    export function sendMessage(message: any, responseCallback?: (response: any) => void): void;
    export const onMessage: {
      addListener(callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void): void;
    };
  }
  
  export namespace storage {
    export const sync: {
      get(keys: string | string[] | Object | null, callback: (items: { [key: string]: any }) => void): void;
      set(items: Object, callback?: () => void): void;
    };
    export const local: {
      get(keys: string | string[] | Object | null, callback: (items: { [key: string]: any }) => void): void;
      set(items: Object, callback?: () => void): void;
    };
  }
  
  export namespace webRequest {
    export interface WebRequestDetails {
      url: string;
      tabId: number;
      requestId: string;
      timeStamp: number;
      requestBody?: any;
    }
    
    export interface WebResponseDetails {
      url: string;
      tabId: number;
      requestId: string;
      timeStamp: number;
      statusCode: number;
      statusLine: string;
    }
    
    export const onBeforeRequest: {
      addListener(
        callback: (details: WebRequestDetails) => { cancel: boolean } | void,
        filter: { urls: string[], types?: string[] },
        extraInfoSpec?: string[]
      ): void;
    };
    
    export const onCompleted: {
      addListener(
        callback: (details: WebResponseDetails) => void,
        filter: { urls: string[], types?: string[] }
      ): void;
    };
  }
  
  export namespace declarativeNetRequest {
    // Placeholder for declarativeNetRequest API
  }
}
