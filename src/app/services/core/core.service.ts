import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs/internal/Observable';
import { AddLicenseKeyComponent } from 'src/app/modal-components/add-license-key/add-license-key.component';
import { ConfirmDialogComponent } from 'src/app/modal-components/confirm-dialog/confirm-dialog.component';
import { HelpMenuComponent } from 'src/app/modal-components/help-menu/help-menu.component';
import { NoInternetComponent } from 'src/app/modal-components/no-internet/no-internet.component';
import { PasswordResetSuccessComponent } from 'src/app/modal-components/password-reset-success/password-reset-success.component';
import { SelectLanguageComponent } from 'src/app/modal-components/select-language/select-language.component';
import { SharePrescriptionErrorComponent } from 'src/app/modal-components/share-prescription-error/share-prescription-error.component';
import { SharePrescriptionSuccessComponent } from 'src/app/modal-components/share-prescription-success/share-prescription-success.component';
import { SharePrescriptionComponent } from 'src/app/modal-components/share-prescription/share-prescription.component';
import { UploadMindmapJsonComponent } from 'src/app/modal-components/upload-mindmap-json/upload-mindmap-json.component';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  constructor(private dialog: MatDialog) { }

  openConfirmationDialog(data: { confirmationMsg: string }): MatDialogRef<ConfirmDialogComponent> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { panelClass: 'modal-md', data } );
    return dialogRef;
  }

  openHelpMenuModal(): MatDialogRef<HelpMenuComponent> {
    const dialogRef = this.dialog.open(HelpMenuComponent, { panelClass: "chatbot-container", backdropClass: "chatbot-backdrop", width: "100%", maxHeight: "500px", maxWidth: "300px", position: { bottom: "80px", right: "20px" }, hasBackdrop: false } );
    return dialogRef;
  }

  openAddLicenseKeyModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(AddLicenseKeyComponent, { panelClass: 'modal-md', data });
    return dialogRef.afterClosed();
  }

  openUploadMindmapModal(): Observable<any> {
    const dialogRef = this.dialog.open(UploadMindmapJsonComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }

  openNoInternetConnectionModal(): Observable<any> {
    const dialogRef = this.dialog.open(NoInternetComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }

  openPasswordResetSuccessModal(): Observable<any> {
    const dialogRef = this.dialog.open(PasswordResetSuccessComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }

  openSelectLanguageModal(): Observable<any> {
    const dialogRef = this.dialog.open(SelectLanguageComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }

  openSharePrescriptionConfirmModal(): Observable<any> {
    const dialogRef = this.dialog.open(SharePrescriptionComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }

  openSharePrescriptionSuccessModal(): Observable<any> {
    const dialogRef = this.dialog.open(SharePrescriptionSuccessComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }

  openSharePrescriptionErrorModal(data: { msg:string, confirmBtnText: string }): Observable<any> {
    const dialogRef = this.dialog.open(SharePrescriptionErrorComponent, { panelClass: 'modal-md', data });
    return dialogRef.afterClosed();
  }
}
