import { AfterContentChecked, ChangeDetectorRef, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { PageTitleItem } from '../core/models/page-title-model';
import { PageTitleService } from '../core/page-title/page-title.service';
import { AuthService } from '../services/auth.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { CoreService } from '../services/core/core.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { ActivatedRoute, ActivatedRouteSnapshot, Event, NavigationEnd, Router, RouterStateSnapshot } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { HelpMenuComponent } from '../modal-components/help-menu/help-menu.component';
import { SocketService } from '../services/socket.service';
import { SwPush } from '@angular/service-worker';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { TranslateService } from '@ngx-translate/core';
import { RaiseTicketComponent } from '../modal-components/raise-ticket/raise-ticket.component';
import { ProfileService } from '../services/profile.service';
import { getCacheData } from '../utils/utility-functions';
import { languages, doctorDetails } from 'src/config/constant';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.scss']
})
export class MainContainerComponent implements OnInit, AfterContentChecked, OnDestroy {

  collapsed = false;
  baseUrl: string = environment.baseURL;
  baseURLLegacy: string = environment.baseURLLegacy;
  username = '';
  header: PageTitleItem;
  _mode = 'side';
  isMobile = false;
  _opened = true;
  _showBackdrop = false;
  _closeOnClickOutside = false;
  sidebarClosed = false;
  subscription: Subscription;
  subscription1: Subscription;
  searchForm: FormGroup;
  public breadcrumbs: any[];
  @ViewChild('drawer') drawer: MatDrawer;
  dialogRef: MatDialogRef<HelpMenuComponent>;
  dialogRef2: MatDialogRef<RaiseTicketComponent>;
  routeUrl = '';
  adminUnread = 0;
  notificationEnabled = false;
  profilePic: string;
  profilePicSubscription;

  constructor(
    private cdref: ChangeDetectorRef,
    private authService: AuthService,
    private pageTitleService: PageTitleService,
    private breakpointObserver: BreakpointObserver,
    private coreService: CoreService,
    private toastr: ToastrService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,
    private _swPush: SwPush,
    private translateService: TranslateService,
    private profileService: ProfileService
  ) {
    this.searchForm = new FormGroup({
      keyword: new FormControl('', Validators.required)
    });
    this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
    this.routeUrl = this.breadcrumbs[0]?.url;
  }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.title.subscribe((val: PageTitleItem) => {
      this.header = val;
    });

    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe((result: BreakpointState) => {
      if (result.matches) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
      this._mode = (this.isMobile) ? 'over' : 'side';
      this._closeOnClickOutside = (this.isMobile) ? true : false;
      this._showBackdrop = (this.isMobile) ? true : false;
      this._opened = !this.isMobile;
      this.sidebarClosed = false;
    });

    this.subscription = this.router.events.pipe(
      filter((event: Event) => event instanceof NavigationEnd),
      distinctUntilChanged(),
    ).subscribe(() => {
        this.routeUrl = this.router.url;
        this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
        document.getElementsByClassName('admin-sidenav-content')[0]?.scrollTo(0, 0);
    });

    this.subscription1 = this.socketService.adminUnread.subscribe(res => {
      this.adminUnread = res;
    });

    this.requestSubscription();
    this.getNotificationStatus();

    this.profilePic = this.baseUrl + '/personimage/' + this.provider?.person.uuid;
    this.profilePicSubscription = this.profileService.profilePicUpdateEvent.subscribe(img => {
      this.profilePic = img;
    });
  }

  requestSubscription() {
    if (!this._swPush.isEnabled) {
      return;
    }
    this._swPush.subscription.subscribe(sub => {
      if (!sub) {
        this._swPush.requestSubscription({
          serverPublicKey: environment.vapidPublicKey
        }).then((_) => {
          (async () => {
            // Get the visitor identifier when you need it.
            const fp = await FingerprintJS.load();
            const result = await fp.get();
            this.authService.subscribePushNotification(
              _,
              this.user.uuid,
              result.visitorId,
              this.provider.person.display,
              this.getSpecialization()
            ).subscribe(response => {
            });
          })();
        }).catch((_) => {});
      } else {
        this._swPush.messages.subscribe(payload => {
        });
      }
    });
  }

  getNotificationStatus() {
    this.authService.getNotificationStatus(this.user?.uuid).subscribe((res: any) => {
      if (res.success) {
        this.notificationEnabled = res.data?.notification_status;
      }
    });
  }

  getSpecialization(attr: any = this.provider.attributes) {
    let specialization = null;
    for (let x = 0; x < attr.length; x++) {
      if (attr[x].attributeType.uuid === 'ed1715f5-93e2-404e-b3c9-2a2d9600f062' && !attr[x].voided) {
        specialization = attr[x].value;
        break;
      }
    }
    return specialization;
  }

  ngAfterContentChecked(): void {
    this.cdref.detectChanges();
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  selectLanguage(): void {
    this.coreService.openSelectLanguageModal().subscribe((res: any) => {
    });
  }

  changePassword() {
    this.router.navigate(['/dashboard/change-password']);
  }

  getUrl() {
    return `assets/icons/dashboard-icons/Vector${this.collapsed ? '2' : ''}.png`;
  }

  logout() {
    this.coreService.openConfirmationDialog({ confirmationMsg: 'Are you sure you want to logout?', cancelBtnText: 'No', confirmBtnText: 'Yes' }).afterClosed().subscribe(res => {
      if (res) {
        this.authService.logOut();
      }
    });
  }

  search() {
    if (this.searchForm.value.keyword === null || this.searchForm.value.keyword.length < 3) {
      this.toastr.warning(this.translateService.instant('Please enter minimum 3 characters to search patient....'), this.translateService.instant('Warning'));
    } else {
      const url = `${this.baseUrl}/patient?q=${this.searchForm.value.keyword}&v=custom:(uuid,identifiers:(identifierType:(name),identifier),person)`;
      this.http.get(url).subscribe((response: any) => {
        const values = [];
        response['results'].forEach((value: any) => {
          if (value) {
            if (value.identifiers.length) {
              values.push(value);
            }
          }
        });
        this.coreService.openSearchedPatientModal(values).subscribe((result: any) => {});
        this.searchForm.reset();
      },
        (err) => {
          if (err.error instanceof Error) {
            this.toastr.error('Client-side error', null, { timeOut: 2000 });
          } else {
            this.toastr.error('Server-side error', null, { timeOut: 2000 });
          }
        }
      );
    }
  }

  buildBreadCrumb(route: ActivatedRoute, url: string = '', breadcrumbs: any[] = []): any[] {
    // If no routeConfig is avalailable we are on the root path
    const label = route.routeConfig && route.routeConfig.data ? route.routeConfig.data.breadcrumb : '';
    let path = route.routeConfig && route.routeConfig.data ? route.routeConfig.path : '';
    // If the route is dynamic route such as ':id', remove it
    const lastRoutePart = path.split('/').pop();
    const isDynamicRoute = lastRoutePart.startsWith(':');
    const rs = (route.snapshot) ? route.snapshot : this.searchData(this.router.routerState.snapshot, path);
    if (isDynamicRoute && !!rs) {
      const paramName = lastRoutePart.split(':')[1];
      path = path.replace(lastRoutePart, rs.params[paramName]);
    }

    // In the routeConfig the complete path is not available,
    // so we rebuild it each time
    const nextUrl = path ? `${url}/${path}` : url;

    const breadcrumb: any = {
        label: label,
        url: nextUrl,
    };
    // Only adding route with non-empty label
    const newBreadcrumbs = breadcrumb.label ? [ ...breadcrumbs, breadcrumb ] : [ ...breadcrumbs];
    if (route.firstChild) {
        // If we are not on our current path yet,
        // there will be more children to look after, to build our breadcumb
        return this.buildBreadCrumb(route.firstChild, nextUrl, newBreadcrumbs);
    }
    return newBreadcrumbs;
  }

  searchData(state: RouterStateSnapshot, path: string): ActivatedRouteSnapshot {
    let expectedChild: ActivatedRouteSnapshot | null;
    let child: ActivatedRouteSnapshot | null;
    child = state.root.firstChild;
    while (child != null) {
        if (child.routeConfig.path === path) {
          expectedChild = child;
          break;
        }
        child = child.firstChild;
    }
    return expectedChild;
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.drawer.toggle();
    }
  }

  openHelpMenu() {
    if (this.dialogRef) {
      this.dialogRef.close();
      return;
    }
    this.dialogRef = this.coreService.openHelpMenuModal();
    this.dialogRef.afterClosed().subscribe(result => {
      this.dialogRef = undefined;
    });
  }

  openRaiseTicketModal() {
    if (this.dialogRef2) {
      this.dialogRef2.close();
      return;
    }
    this.dialogRef2 = this.coreService.openRaiseTicketModal();
    this.dialogRef2.afterClosed().subscribe(result => {
      this.dialogRef2 = undefined;
    });
  }

  toggleNotification() {
    this.authService.toggleNotificationStatus(this.user.uuid).subscribe((res: any) => {
      if (res.success) {
        this.notificationEnabled = res.data?.notification_status;
        this.toastr.success(`${this.translateService.instant('Notifications turned')} ${ this.notificationEnabled ? this.translateService.instant('On') : this.translateService.instant('Off')} ${this.translateService.instant('successfully!')}`,
         `${this.translateService.instant('Notifications')} ${ this.notificationEnabled ? this.translateService.instant('On') : this.translateService.instant('Off') }`);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.subscription1?.unsubscribe();
    this.profilePicSubscription.unsubscribe();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    if (this.dialogRef2) {
      this.dialogRef2.close();
    }
  }

  get user() {
    return getCacheData(true, doctorDetails.USER);
  }

  get provider() {
    return getCacheData(true, doctorDetails.PROVIDER);
  }
}
