var passwordIndex = 0;

var passwordService;

function login() {
	passwordIndex++;
	passwordService = null;
	
	connectAndGetService()
		.then(() => {
			return readUserName();
		})
		.then((userName) => {
			return writePasswordID()
				.then(() => {return userName;});
		})
		.then((userName) => {
			return readPassword()
				.then((password) => {
					window.alert('User name: ' + userName + ' password: ' + password);
				});
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

function readUserName() {
	   return passwordService.getCharacteristic('cf6b3b42-17fe-481a-8328-62891fb8aefd')
		 .then(characteristic => {return characteristic.readValue();})
		 .then(value => {
			 var userName = String.fromCharCode.apply(null, new Uint8Array(value.buffer));
			 return userName;
		 });
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

function readPassword() {
	   return passwordService.getCharacteristic('cf6b44ac-17fe-481a-8328-62891fb8aefd')
		 .then(characteristic => {return characteristic.readValue();})
		 .then(value => {
			 var password = String.fromCharCode.apply(null, new Uint8Array(value.buffer));
			 return password;
		 });	
}