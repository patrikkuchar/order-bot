import {Injectable} from '@angular/core';
import {MessageService} from 'primeng/api';
import {MyTranslateService} from './my-translate.service';

export type ToastCmd<T> = {
  key: string,
  title: keyof T,
  msg: keyof T,
  severity: 'info' | 'warn' | 'error' | 'success'
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private messageSvc: MessageService,
              private translateSvc: MyTranslateService) { }

  show<T extends object>(cmd: ToastCmd<T>): void {
    const translated = this.translateSvc.getBy<T>(cmd.key, 'object');
    if (!translated) {
      console.warn(`No translation found for toast key '${cmd.key}'`);
      return;
    }

    const title = translated[cmd.title] as string;
    const msg = translated[cmd.msg] as string;
    this.showToast(cmd.severity, title, msg);
  }

  info(msg: string, title?: string): void {
    this.handleMsg(msg, 'info', title);
  }

  warn(msg: string, title?: string): void {
    this.handleMsg(msg, 'warn', title);
  }

  error(msg: string, title?: string): void {
    this.handleMsg(msg, 'error', title);
  }

  success(msg: string, title?: string): void {
    this.handleMsg(msg, 'success', title);
  }

  private handleMsg(msg: string, severity: string, title?: string): void {
    this.translateSvc.get$([msg, title].filter(Boolean) as string[]).subscribe(translations => {
      const tMsg = translations[msg];
      const tTitle = title ? translations[title!] : undefined;
      this.showToast(severity, tTitle, tMsg);
    });
  }

  private showToast(severity: string, title: string | undefined, msg: string): void {
    this.messageSvc.add({severity, summary: title, detail: msg});
  }
}
