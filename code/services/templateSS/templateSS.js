/**
 * Mention the <platform version> parameterized, that serves as a info on when this Code template was used
 */

/**
 * REQ
 */

/**
 * RESP (success and error, mention how resp.success and resp.error behave differently in Stream Services)
 */

/** 
 * Just for reference here, shouldn't be part of the template
 * Description: Allows for infinite execution of logic, parallelly.
 */

function templateSS(req, resp) {
  ClearBlade.init({ request: req });
  var messaging = ClearBlade.Messaging();
  const TOPIC = "$share/yash/device/_broadcast";
  messaging.subscribe(TOPIC, WaitLoop);

  function WaitLoop(err, data) {

    if (err) {
      // DEBUG MESSAGE
      messaging.publish("error", "Subscribe failed: " + data);
      resp.error(data);
    }
    // DEBUG MESSAGE
    messaging.publish("success", "Subscribed to Shared Topic. Starting Loop.");

    while (true) {
      messaging.waitForMessage([TOPIC], function(err, msg, topic) {
        if (err) {
          // DEBUG MESSAGE
          messaging.publish("error", "Failed to wait for message: " + err + " " + msg + "  " + topic);
          resp.error("Failed to wait for message: " + err + " " + msg + "    " + topic);
        } 
        processMessage(msg, topic);
      });
    }
  }

  function processMessage(msg, topic) {
    log("Something happened");
    messaging.publish("success", "Received message " +msg+ " "+ topic);

    // Examples of process message tasks:
    // - Storing message in a collection: https://github.com/ClearBlade/native-libraries/blob/master/clearblade.md#collectioncreatenewitem-callback
    // - Process and publish to another topic: https://github.com/ClearBlade/native-libraries/blob/master/clearblade.md#messagepublishtopic-payload
    // - Update a Device State: https://github.com/ClearBlade/native-libraries/blob/master/clearblade.md#deviceupdatequery-changes-callback
  }
}