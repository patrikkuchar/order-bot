export class ScrollUtils {
  static scrollToElementById(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      this.scroll(el);
    }
  }

  static scroll(el: HTMLElement): void {
    el.scrollIntoView({behavior: 'smooth', block: 'center'});
    //window.scroll({
    //  top: this.getTopOffset(el),
    //  left: 0,
    //  behavior: 'smooth'
    //});
  }

  private static getTopOffset(controlEl: HTMLElement): number {
    const labelOffset = 120;
    return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
  }
}
