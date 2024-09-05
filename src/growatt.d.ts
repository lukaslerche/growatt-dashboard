declare module 'growatt' {
    export default class Growatt {
      constructor(options: any);
      login(user: string, password: string): Promise<any>;
      getAllPlantData(options: any): Promise<any>;
      logout(): Promise<any>;
    }
  }