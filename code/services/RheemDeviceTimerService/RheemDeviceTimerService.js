function RheemDeviceTimerService(req, resp) {
  ClearBlade.init({ request: req });
  var messaging = ClearBlade.Messaging();
  var deviceCollection = ClearBlade.Collection({
    collectionName: "device_collection"
  });

  const DEFAULT_TIMEOUT = 24*3600*1000; // 24hrs in ms    
  const SHARED_TOPIC = "$share/Group1/device/+/+/conf";

  messaging.subscribe(SHARED_TOPIC, function (err, data) {
    if (err) {
      // DEBUG MESSAGE
      messaging.publish("error", "Subscribe failed: " + data);
      resp.error(data);
    }
    // DEBUG MESSAGE
    messaging.publish("success", "Subscribed to Shared Topic");
    // Once successfully subscribed
    WaitLoop();
  });

  function WaitLoop() {
    // DEBUG MESSAGE
    messaging.publish("success", "Starting the Loop");
    
    while (true) {
      messaging.waitForMessage([SHARED_TOPIC], function (err, msg, topic) {
        if (err) {
          // DEBUG MESSAGE
          messaging.publish("error", "Failed to wait for message: " + err + " " + msg + "  " + topic);
          resp.error("Failed to wait for message: " + err + " " + msg + "    " + topic);
        } else {
          handler(msg,topic);
        }
      });
    }
  }

  function handler(msg, topic) {
    try {
      var parseMsg = JSON.parse(msg);
    } catch (e) {
      // DEBUG MESSAGE
      messaging.publish("error", "Problem with parsing: " + e);
      resp.error("Problem with parsing: " + e);
    }
    const deviceId = topic.split('/')[1];
    const action = topic.split('/')[2];
    
    messaging.setInterval()
    

    }
    // Assumption ParsedMessage Structure:
    {
      timeout: 86400000, 
      
    }
    messaging.setInterval()
  }

  function addCollectionRows(rows) {
    deviceCollection.create(rows, function (err, result) {
      if (err) {
        // DEBUG MESSAGE
        messaging.publish("error", "failed to create: " + result);
        resp.error("create failed: " + result);
      } else {
        //no op
      }
    });
  }
}
