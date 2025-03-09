export interface IElectronAPI {
  send: (channel: string, data: unknown) => void;
  on: (channel: string, func: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
} 