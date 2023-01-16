import { Component, OnInit } from "@angular/core";
import { HeaderService } from "src/app/services/header.service";
import { SocketService } from "src/app/services/socket.service";

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}
@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  isSideNavCollapsed: boolean = false;
  screenWidth: number = 0;

  constructor(
    private headerSvc: HeaderService,
    private socketSvc: SocketService
  ) {
    this.headerSvc.showSearchBar = true;
  }

  ngOnInit(): void {
    this.socketSvc.initSocket(true);
  }

  onToggleSideNav(data: SideNavToggle) {
    this.screenWidth = data.screenWidth;
    this.isSideNavCollapsed = data.collapsed;
  }

  get bodyClass() {
    let styleClass = "";
    if (this.isSideNavCollapsed && this.screenWidth > 768) {
      styleClass = "body-trimmed";
    } else {
      styleClass = "body-extend";
    }
    return styleClass;
  }
}
