import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-login-image-container",
  templateUrl: "./login-image-container.component.html",
  styleUrls: ["./login-image-container.component.scss"],
})
export class LoginImageContainerComponent implements OnInit {
  showNavigationArrows = false;
  currentYear = new Date().getFullYear();
  constructor() {}

  ngOnInit(): void {}
}
