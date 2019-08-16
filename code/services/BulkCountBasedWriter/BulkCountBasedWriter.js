/**
 * This is a stream service using shared subscriptions and performs bulk inserts into a collection. Change the shared sub constants in the code,
 * Also, add any parsing of day if needed, before performing a collection insert to make sure that the schema conforms.
 * Note: Some data might be lost in case, if the service is terminated, since few rows might still be in memory.
 */
function BulkCountBasedWriter(req, resp) {
  ClearBlade.init({ request: req });
  const messaging = ClearBlade.Messaging();
  
  // ### Shared Sub Configuration Constants
  const BULK_OPERATION_COUNT = 10; // Perform 10 Operations at once
  const SHARED_MSG_TOPIC = "$share/StreamServiceGroup/device/+";
  const COLLECTION_NAME = "example_collection";
  
  const SERVICE_ID = req.service_instance_id;
  var counter = 0;
  var rows = [];

  messaging.publish("service_id", SERVICE_ID);
  messaging.subscribe(SHARED_MSG_TOPIC, function(err, errMsg) {
    if (err) {
      messaging.publish("error", "sub failed: " + errMsg);
      resp.error(errMsg);
    }
    messaging.publish("success", "Subscribed to: " + SHARED_MSG_TOPIC);
    WaitLoop();
  });

  function WaitLoop() {
    while (true) {
        messaging.waitForMessage([SHARED_MSG_TOPIC], HandleMessage);
    }
  }

  function HandleMessage(err, msg, topic) {
    if (err) {
      messaging.publish("error", "failed to wait for message: " + err + " " + msg + "  " + topic);
    } else {
      // ### Invoke ProcessMessage Function Here!! ###
      ProcessMessage(msg);
    }
  }

  /**
   * This method processes the message. This logic can be replaced with custom logic to perform any other task.
   * In this scenario, it holds upto BULK_OPERATION_COUNT rows in memory, before inserting into the collection.
   * 
   */
  function ProcessMessage(msg) {
    try {
      counter = counter + 1;
      const parseMsg = JSON.parse(msg);
      var new_row = {
        data: parseMsg.device_data,
        service_id: SERVICE_ID
      };
      rows.push(new_row);

      if (counter == BULK_OPERATION_COUNT) {
        messaging.publish("bulk_ops", SERVICE_ID + "  inserted "+ BULK_OPERATION_COUNT + " rows!");
        PerformBulkWrites(rows);
        rows = [];
        counter = 0;
      }
    } catch (e) {
      messaging.publish("error", "Error Parsing Message: " + e);
      resp.error(e);
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
