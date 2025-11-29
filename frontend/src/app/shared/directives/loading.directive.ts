import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  ComponentRef,
  Type,
  OnDestroy,
  OnInit,
  Renderer2,
  ElementRef,
  Injector,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import {debounceTime, Observable, Subscription} from 'rxjs';
import {SpinnerComponent} from '../components/spinner.component';
import {Button} from 'primeng/button';

@Directive({
  selector: '[appLoading]',
  standalone: true,
})
export class LoadingDirective implements OnInit, OnDestroy {
  // Microsyntax inputs: *appLoading="loading$; skeleton: MySkeleton; button: true"
  @Input('appLoading') loading$!: Observable<boolean>;
  @Input('skeleton') skeleton?: Type<any>;
  @Input('buttonLoading') buttonLoading?: boolean;

  private sub?: Subscription;
  private skeletonRef?: ComponentRef<any>;
  private spinnerRef?: ComponentRef<any>;
  private viewCreated = false;

  // Modern inject() syntax
  private renderer = inject(Renderer2);
  private el = inject(ElementRef);
  private injector = inject(Injector);
  private vcr = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef, { optional: true });
  private pButton = inject(Button, { optional: true, host: true });  // Optional inject for PrimeNG Button
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    if (!this.loading$) {
      console.warn('[appLoading] Missing loading$ observable input');
      return;
    }

    this.sub = this.loading$
      .pipe(debounceTime(100))
      .subscribe((loading) => {
      console.log('[appLoading] loading state:', loading);
      if (this.buttonLoading && this.pButton) {
        console.log('[appLoading] Setting PrimeNG button loading state:', loading);
        this.pButton.loading = loading;
        this.cdr.markForCheck();
        return;
      }

      this.vcr.clear();

      if (loading) {
        this.showLoading();
      } else {
        this.showContent();
      }
    });
  }

  private showLoading() {
    // Prefer skeleton if defined
    if (this.skeleton) {
      this.showSkeleton();
    } else {
      this.showSpinner();
    }

    this.viewCreated = false;
  }

  private showSkeleton() {
    if (!this.skeleton) return; // Guard against undefined
    try {
      this.skeletonRef = this.vcr.createComponent(this.skeleton, { injector: this.injector });
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
    } catch (e) {
      console.error('[appLoading] Error creating skeleton component:', e);
    }
  }

  private showSpinner() {
    try {
      this.spinnerRef = this.vcr.createComponent(SpinnerComponent, { injector: this.injector });
      this.renderer.appendChild(this.el.nativeElement, this.spinnerRef.location.nativeElement);
      this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    } catch (e) {
      console.error('[appLoading] Error creating spinner:', e);
    }
  }

  private showContent() {
    if (this.templateRef && !this.viewCreated) {
      this.vcr.createEmbeddedView(this.templateRef);
      this.viewCreated = true;
    }

    // Show element if not structural
    if (!this.templateRef) {
      this.renderer.removeStyle(this.el.nativeElement, 'display');
      this.renderer.removeStyle(this.el.nativeElement, 'position');
    }

    this.skeletonRef?.destroy();
    this.spinnerRef?.destroy();
    this.skeletonRef = undefined;
    this.spinnerRef = undefined;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.skeletonRef?.destroy();
    this.spinnerRef?.destroy();
  }
}
