import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponent } from './explore-container.component';
import { IBeacon } from '@awesome-cordova-plugins/ibeacon/ngx';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';
import { BLE } from '@awesome-cordova-plugins/ble/ngx';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule],
  declarations: [ExploreContainerComponent],
  exports: [ExploreContainerComponent],
  providers: [IBeacon, Device, LocalNotifications, BLE, BackgroundMode, HTTP]
})
export class ExploreContainerComponentModule {}
