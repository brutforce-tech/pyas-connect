/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface PyasConnect {
        "clientId": string;
        /**
          * @default ''
         */
        "formDescription": string;
        /**
          * @default 'Enter Your Details'
         */
        "formTitle": string;
        /**
          * @default ''
         */
        "modalDescription": string;
        /**
          * @default 'Connect an Account'
         */
        "modalTitle": string;
        /**
          * @default 'This app'
         */
        "productName": string;
        /**
          * @default true
         */
        "showDisclaimer": boolean;
        /**
          * @default true
         */
        "showGoogle": boolean;
        /**
          * @default false
         */
        "showIcloud": boolean;
        /**
          * @default true
         */
        "showLabels": boolean;
        /**
          * @default true
         */
        "showOutlook": boolean;
        /**
          * @default true
         */
        "showZoom": boolean;
        /**
          * @default ''
         */
        "state": string;
        /**
          * @default 'light'
         */
        "theme": 'light' | 'dark';
        "tokenName": string;
        "userEmail"?: string;
        "userName"?: string;
    }
}
export interface PyasConnectCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLPyasConnectElement;
}
declare global {
    interface HTMLPyasConnectElementEventMap {
        "accountConnected": { provider: string; accountId: string, name: string, email: string, scopes: string[], status: string };
        "connectError": { message: string, code: string|number|undefined, error?: any };
    }
    interface HTMLPyasConnectElement extends Components.PyasConnect, HTMLStencilElement {
        addEventListener<K extends keyof HTMLPyasConnectElementEventMap>(type: K, listener: (this: HTMLPyasConnectElement, ev: PyasConnectCustomEvent<HTMLPyasConnectElementEventMap[K]>) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof HTMLPyasConnectElementEventMap>(type: K, listener: (this: HTMLPyasConnectElement, ev: PyasConnectCustomEvent<HTMLPyasConnectElementEventMap[K]>) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }
    var HTMLPyasConnectElement: {
        prototype: HTMLPyasConnectElement;
        new (): HTMLPyasConnectElement;
    };
    interface HTMLElementTagNameMap {
        "pyas-connect": HTMLPyasConnectElement;
    }
}
declare namespace LocalJSX {
    interface PyasConnect {
        "clientId"?: string;
        /**
          * @default ''
         */
        "formDescription"?: string;
        /**
          * @default 'Enter Your Details'
         */
        "formTitle"?: string;
        /**
          * @default ''
         */
        "modalDescription"?: string;
        /**
          * @default 'Connect an Account'
         */
        "modalTitle"?: string;
        /**
          * Emit connection result
         */
        "onAccountConnected"?: (event: PyasConnectCustomEvent<{ provider: string; accountId: string, name: string, email: string, scopes: string[], status: string }>) => void;
        /**
          * Emit error result
         */
        "onConnectError"?: (event: PyasConnectCustomEvent<{ message: string, code: string|number|undefined, error?: any }>) => void;
        /**
          * @default 'This app'
         */
        "productName"?: string;
        /**
          * @default true
         */
        "showDisclaimer"?: boolean;
        /**
          * @default true
         */
        "showGoogle"?: boolean;
        /**
          * @default false
         */
        "showIcloud"?: boolean;
        /**
          * @default true
         */
        "showLabels"?: boolean;
        /**
          * @default true
         */
        "showOutlook"?: boolean;
        /**
          * @default true
         */
        "showZoom"?: boolean;
        /**
          * @default ''
         */
        "state"?: string;
        /**
          * @default 'light'
         */
        "theme"?: 'light' | 'dark';
        "tokenName"?: string;
        "userEmail"?: string;
        "userName"?: string;
    }
    interface IntrinsicElements {
        "pyas-connect": PyasConnect;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "pyas-connect": LocalJSX.PyasConnect & JSXBase.HTMLAttributes<HTMLPyasConnectElement>;
        }
    }
}
