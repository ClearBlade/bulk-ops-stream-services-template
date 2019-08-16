function Publisher(req, resp) {
  ClearBlade.init({request:req});
  const messaging = ClearBlade.Messaging();
  const msg = {
      deviceData:"I am Active"
  }
  //log("TESTING");
  for(var i=0 ;i<30;i++){
    messaging.publish("devices/device-10", JSON.stringify(msg));
  }
  resp.success('Success');
}
