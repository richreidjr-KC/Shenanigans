declare module "osc" {
  function OSC(options?: any): void;

  namespace OSC {
    class UDPPort {
      constructor(options?: any);
      open(): void;
      close(): void;
      on(event: string, callback: (...args: any[]) => void): void;
      send(message: any): void;
    }
  }

  export = OSC;
}
