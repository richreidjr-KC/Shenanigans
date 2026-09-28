declare module "osc" {
  export default class OSC {}

  export class UDPPort {
    constructor(options?: any);
    open(): void;
    close(): void;
    on(event: string, callback: (...args: any[]) => void): void;
    send(message: any): void;
  }
}
