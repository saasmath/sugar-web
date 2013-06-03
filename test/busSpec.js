define(function (require) {

    var bus = require("sugar-web/bus");

    describe("datastore", function () {
        var client;

        function MockClient() {
            this.result = [];
            this.error = null;
        }

        MockClient.prototype.send = function (data) {
            var me = this;
            setTimeout(function () {
                parsed = JSON.parse(data);

                message = {
                    data: JSON.stringify({
                        result: me.result,
                        error: me.error,
                        id: parsed.id
                    })
                };

                me.onMessage(message);
            }, 0);
        };

        MockClient.prototype.close = function () {};

        beforeEach(function () {
            client = new MockClient();
            bus.listen(client);
        });

        afterEach(function () {
            bus.close();
            client = null;
        });

        it("should receive a response", function () {
            var responseReceived;

            runs(function () {
                responseReceived = false;

                function onResponseReceived(error, result) {
                    expect(error).toBeNull();
                    expect(result).toEqual(["hello"]);
                    responseReceived = true;
                }

                client.result = ["hello"];

                bus.sendMessage("hello", [], onResponseReceived);
            });

            waitsFor(function () {
                return responseReceived;
            }, "a response should be received");
        });

        it("should receive an error", function () {
            var errorReceived;

            runs(function () {
                errorReceived = false;

                function onResponseReceived(error, result) {
                    expect(error).toEqual(jasmine.any(Error));
                    expect(result).toBeNull();

                    errorReceived = true;
                }

                client.result = null;
                client.error = new Error("error");

                bus.sendMessage("hello", [], onResponseReceived);
            });

            waitsFor(function () {
                return errorReceived;
            }, "an error should be received");
        });

    });
});
