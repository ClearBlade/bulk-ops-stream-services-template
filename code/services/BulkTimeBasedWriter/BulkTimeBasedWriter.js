
function BulkTimeBasedWriter(req, resp) {
  ClearBlade.init({ request: req });
  const messaging = ClearBlade.Messaging();
  
  // ### Shared Sub Configuration Constants
  const BULK_OPERATION_TIME_IN_MS = 5000; // Perform Operations every X milliseconds
  //NOTE: As of 6.1.1 Multiple Shared Groups are not Supported!!
  const SHARED_MSG_TOPIC = "$share/a/devices/+";
  const COLLECTION_NAME = "example_collection";
  const SERVICE_ID = req.service_instance_id;
  const TIMEOUT_TOPIC = "timeout/" + SERVICE_ID;
  var TIMEOUT_TOPIC_SUBSCRIBED = false; 
  var rows = [];
  
  messaging.publish("service_id", SERVICE_ID);
  messaging.subscribe(TIMEOUT_TOPIC, function(err, data) {
    if (err) {
      messaging.publish("error", "Subscribe failed: " + data);
      resp.error(data);
    }
    TIMEOUT_TOPIC_SUBSCRIBED = true;
  });

  messaging.subscribe(SHARED_MSG_TOPIC, function(err, data) {
    if (err) {
      messaging.publish("error", "Subscribe failed: " + data);
      resp.error(data);
    }
    if (!TIMEOUT_TOPIC_SUBSCRIBED){
        messaging.publish("error", "Timeout topic not yet subscribed, so cannot start the service ");
        resp.error("Timeout topic not yet subscribed, so cannot start the service.");
    }
    
    messaging.publish("success", "Subscribed to " + SHARED_MSG_TOPIC);
    //Kicking off the timer, before starting the wait-loop
    StartTimeoutPublish();
    WaitLoop();
  });

  function StartTimeoutPublish(){
      messaging.setInterval(BULK_OPERATION_TIME_IN_MS, TIMEOUT_TOPIC, "TimeoutPublish", -1, function(err, timeoutMsg) {
          if(err) {
              messaging.publish("error", "setTimeout failed with some error"+ timeoutMsg);
          }
      });
  }

  function WaitLoop() {
    while (true) {
        messaging.waitForMessage([SHARED_MSG_TOPIC, TIMEOUT_TOPIC], HandleMessage);
    }
  }

  function HandleMessage(err, msg, topic) {
    if (err) {
      messaging.publish("error", "failed to wait for message: " + err + " " + msg + "  " + topic);
      resp.error("failed to wait for message: " + err + " " + msg + "  " + topic);  
    }
      
    if (topic === TIMEOUT_TOPIC) {
        if (rows.length > 0) {
            messaging.publish("bulk_ops", SERVICE_ID + " inserted " + rows.length);
            // User can Perform any other operation of their choice here!
            PerformBulkWrites(rows);
            rows = [];
        }
    } else {
        try {
            var parseMsg = JSON.parse(msg);
        } catch (e) {
            // DEBUG MESSAGE
            messaging.publish("error", "Problem with parsing: " + e);
            resp.error("Problem with parsing: " + e);
        }
        
        var new_row = {
            data: parseMsg.device_data,
            service_id: SERVICE_ID
        };
        rows.push(new_row);
    }
  }

  function PerformBulkWrites(rows) {
    // Can be any action, like insert/update into collection or publishing on a topic
    var opts = {};
    opts.collectionName = COLLECTION_NAME;
    opts.item = rows;

    cbCreatePromise(opts).catch(function(err) {
      resp.error(err);
    });
  }

  
}

