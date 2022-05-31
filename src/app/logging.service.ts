import { Injectable } from '@angular/core';

// Demo service for showcasing service loaded in different modules
@Injectable({ providedIn: 'root' }) // provides service app wide, separate instances can be created in other modules.
export class LoggingService {
  lastLog: string;
  printLog(message: string) {
    console.log(message);
    console.log(this.lastLog);
    this.lastLog = message;
  }
}
