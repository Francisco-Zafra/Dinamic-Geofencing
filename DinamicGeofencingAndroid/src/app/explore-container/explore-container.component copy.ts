import { Component, OnInit, Input, Output } from '@angular/core';
import { IBeacon } from '@awesome-cordova-plugins/ibeacon/ngx';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';
import { BLE } from '@awesome-cordova-plugins/ble/ngx';
import { ChangeDetectorRef } from '@angular/core';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent implements OnInit {
  @Input() name: string;
  status: string = "bluetry";
  secret : string = "";
  connectedDevice = "";
  cargando : boolean = false;

  SERVICE_UUID : string = "1111";
  CHARACTERISTIC_UUID : string = "2222";

  constructor(
    private ibeacon: IBeacon, 
    private device: Device, 
    private localNotifications: LocalNotifications, 
    private ble: BLE,
    private changeDetectorRef: ChangeDetectorRef,
    private backgroundMode: BackgroundMode,
    private http: HTTP
  ) { }


  ngOnInit() {

    this.backgroundMode.enable();
    this.changeDetectorRef.detectChanges();
    console.log("----------------_--------------------_--------------------_-----------------");
    // Request permission to use location on iOS
    this.ibeacon.requestAlwaysAuthorization();
    this.localNotifications.requestPermission();
    // create a new delegate and register it with the native layer
    let delegate = this.ibeacon.Delegate();
    // Subscribe to some of the delegate's event handlers
    delegate.didStartMonitoringForRegion()
      .subscribe(
        data => console.log('------------------------didStartMonitoringForRegion------------------------: ', data.region.identifier),
        error => console.error()
      );
    delegate.didEnterRegion()
      .subscribe(
        data => {
          this.status = "Dentro";
          console.log('----------------didEnterRegion---------------------: ', data.region.identifier);
          this.localNotifications.schedule({
            launch: true,
            title: 'Bienvenido',
            text: 'Ha entrado en la región',
            // actions: [
            //   { id: 'yes', title: 'Yes' },
            //   { id: 'no',  title: 'No'  }
            // ]
          });
        },
        error => console.error()
      );
    // this.localNotifications.on('yes').subscribe(() => this.button());

    delegate.didExitRegion()
      .subscribe(
        data => {
          console.log('----------------didExitRegion---------------------: ', data.region.identifier);
          this.status = "Fuera";
          
        },
        error => console.error()
      );

    let beaconRegion = this.ibeacon.BeaconRegion('Raspberry', "8492e75f-4fd6-469d-b132-043fe94921d8");
    this.ibeacon.startMonitoringForRegion(beaconRegion)
      .then(
        () => console.log('---------------------Native layer received the request to monitoring------------------------'),
        error => console.error('Native layer failed to begin monitoring: ', error)
      );
  }

  bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }

  button(){
    this.cargando = true;
    this.getSecretCode().then(pass => {
      console.log("Pass found: " + pass);
      this.secret = pass;
      this.callServer(pass);
      this.connectedDevice = ""
      this.cargando = false;
    });
  }
getSecretCode
  () : Promise<string>{
    console.log("Searching for device");
    return new Promise(resolve => {
      console.log("Scanning " + this.SERVICE_UUID);
      this.ble.scan([this.SERVICE_UUID], 10).subscribe(data => {
        console.log(data.id);
        this.connectedDevice = data.id;
        this.getPassFromConnection(data.id).then(pass => {
          resolve(pass);
        }, 
        () => this.ble.disconnect(data.id).then(() => {console.log("Disconnected due to error in char");}))
      });
      setTimeout(() => {
        console.log("Finished") 
        if(this.connectedDevice == ""){
          this.cargando = false;
        }
      }, 10000);
    });
  }

  getPassFromConnection(id) : Promise<string>{
    console.log("Device found");
    return new Promise(resolve => {
      this.ble.connect(id).subscribe(data => {
        console.log("Reading");
        this.ble.read(id, this.SERVICE_UUID, this.CHARACTERISTIC_UUID).then( pass => {
          this.ble.disconnect(id).then(() => {console.log("Disconnected"); resolve(this.bytesToString(pass)); });
        });
      },
      () => console.log("Fail"));
    });
  }

  async callServer(code){
    console.log("Sending post with codex: " + code);
    try{
      let h = {
        "cotent-type": "application/json",
      }
      const response = await this.http.post('http://192.168.1.50:1234/action', {code: code}, h);
      console.log(response.status);
    }
    catch(error){
      console.error("NADA")
      console.error(error.status);
      console.error(error.error); // Error message as string
      console.error(error.headers);
    }
    console.log("Done");
  }
}
