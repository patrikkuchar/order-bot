
export class TranslateUtils {

  static toastCmdBy(key: string,
                    severity: 'info' | 'warn' | 'error' | 'success',
                    type: 'titlemessage' = 'titlemessage') {
    const cols = (() => {
      switch (type) {
        case 'titlemessage':
          return {
            title: `title`,
            msg: `message`
          };
        default:
          throw new Error(`Unknown toast type: ${type}`);
      }
    })();

    return {
      key,
      ...cols,
      severity
    };
  }
}
