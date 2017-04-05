var passwordIndex = 0;

var passwordService;
var userName;

function login() {
	passwordIndex++;
	passwordService = null;
	
	connectAndGetService()
		.then(() => {
			return registerUserNameNotifications()
		})
		.then(() => {
			registerPasswordNotification()
		})
		.catch(error => { window.alert(error); });
}

function connectAndGetService() {
	return navigator.bluetooth.requestDevice({
	  acceptAllDevices: true,
	  optionalServices: ["cf6b0353-17fe-481a-8328-62891fb8aefd"]
	})
	.then(device => device.gatt.connect())
	.then(server => {
	  return server.getPrimaryService("cf6b0353-17fe-481a-8328-62891fb8aefd");
	})
	.then(service => {
		passwordService = service;
	});
}

function registerUserNameNotifications() {
	   return passwordService.getCharacteristic('cf6b0e6f-17fe-481a-8328-62891fb8aefd')
		 .then(characteristic => {		 
			 return characteristic.startNotifications().then(() => {
				characteristic.addEventListener('characteristicvaluechanged', onUserName);
			 })
		});
}

function onUserName(event) {
	var value = event.target.value;
	userName = String.fromCharCode.apply(null, new Uint8Array(value.buffer));
	
	writePasswordID();
}

function writePasswordID() {
	return passwordService.getCharacteristic('cf6b9fb0-17fe-481a-8328-62891fb8aefd').
		then(characteristic => {
			var buffer = new ArrayBuffer(1);
			var mdata = new DataView(buffer);
			mdata.setInt8(0, passwordIndex);
			return characteristic.writeValue(mdata.buffer);			
		});
}

function registerPasswordNotification() {
	   return passwordService.getCharacteristic('cf6b44ac-17fe-481a-8328-62891fb8aefd')
		 .then(characteristic => {
			return characteristic.startNotifications().then(() => {
				characteristic.addEventListener('characteristicvaluechanged', onPassword);
			})
		})
}

function onPassword(event) {
	var value = event.target.value;	
	var password = String.fromCharCode.apply(null, new Uint8Array(value.buffer));
	window.alert('User name: ' + userName + ' password: ' + password);	
}