function StreamPublisher(req, resp) {
  ClearBlade.init({ request: req });
  const messaging = ClearBlade.Messaging();
  const msg = "I am Active";
  messaging.subscribe("timeout", function (err, msg) { });
  messaging.setInterval(1, "device/device-0", msg, 100, function (err, msg) { });
  messaging.setTimeout(10000, "timeout", "exit time", function (err, msg) { });
  messaging.waitForMessage("timeout", function (err, message, topic) { resp.success("finished"); });
}
