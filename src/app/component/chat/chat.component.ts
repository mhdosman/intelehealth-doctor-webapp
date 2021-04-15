import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ChatService } from "src/app/services/chat.service";
declare const getFromStorage;
@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"],
})
export class ChatComponent implements OnInit {
  @ViewChild("chatInput") chatInput: ElementRef;

  classFlag = false;
  chats = [];
  isUser;
  user_messages;
  message;
  patientId = null;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get("patient_id");
    this.updateMessages();
  }

  get chatElem() {
    return this.chatInput.nativeElement;
  }

  onsubmit() {
    if (this.message) {
      console.log(this.message);
      this.user_messages = {
        message: this.message,
        isUser: true,
      };
      this.chats.push(this.user_messages);
      this.message = "";
    }
  }

  get patientVisitProvider() {
    return getFromStorage("patientVisitProvider");
  }

  get toUser() {
    return this.patientVisitProvider.provider.uuid;
  }

  sendMessage(event) {
    if (this.toUser && this.patientId && this.chatElem.value) {
      this.chatService
        .sendMessage(this.toUser, this.patientId, this.chatElem.value)
        .subscribe((res) => {
          this.updateMessages();
        });
    }
    this.chatElem.value = "";
  }

  updateMessages() {
    this.chatService
      .getPatientMessages(this.toUser, this.patientId)
      .subscribe((res: { data }) => {
        console.log("res: >>>>>>>>>>", res);
        this.chats = res.data;
      });
  }

  onPressEnter(e) {
    if (e?.target?.value && e?.key === "Enter") {
      this.sendMessage(e);
    }
  }

  chatLaunch() {
    this.classFlag = true;
  }
  chatClose() {
    this.classFlag = false;
  }

  get userUuid() {
    return this.chatService.user.uuid;
  }
}
