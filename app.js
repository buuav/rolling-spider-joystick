var quad = require('ar-drone').createClient();
var hid = require('node-hid');
// console.log(hid.devices());
// Logitech Extreme 3D Pro's vendorID and productID: 1133:49685 (i.e. 046d:c215)
var joystick = new hid.HID(1133, 49685);
// console.log(joystick);

var flying = false;
var prevButtons;

quad.on('navdata', console.log);

joystick.on('data', function(buf) {
    var controls = parseControls(buf);
    if (!prevButtons)
        prevButtons = controls.buttons;
    if (prevButtons[0] === 0 && controls.buttons[0] === 1) {
        if (flying) {
            quad.land();
            flying = false;
        } else {
            quad.takeoff();
            flying = true;
        }
    }
    prevButtons = controls.buttons;
    if (controls.buttons[1]) {
        quad.front((512 - controls.pitch) / 512);
        quad.left((512 - controls.roll) / 512);
        quad.counterClockwise((128 - controls.yaw) / 128);
        quad.up((controls.throttle - 128) / 128);
    }
    // console.log(JSON.stringify(controls));
});
joystick.on('error', function() {
    quad.land();
});


function parseControls(buf) {
    var ch = buf.toString('hex').match(/.{1,2}/g).map(function(c) {
        return parseInt(c, 16);
    });
    return {
        roll: ((ch[1] & 0x03) << 8) + ch[0],
        pitch: ((ch[2] & 0x0f) << 6) + ((ch[1] & 0xfc) >> 2),
        yaw: ch[3],
        view: (ch[2] & 0xf0) >> 4,
        throttle: -ch[5] + 255,
        buttons: [
            (ch[4] & 0x01) >> 0, (ch[4] & 0x02) >> 1, (ch[4] & 0x04) >> 2, (ch[4] & 0x08) >> 3, (ch[4] & 0x10) >> 4, (ch[4] & 0x20) >> 5, (ch[4] & 0x40) >> 6, (ch[4] & 0x80) >> 7, (ch[6] & 0x01) >> 0, (ch[6] & 0x02) >> 1, (ch[6] & 0x04) >> 2, (ch[6] & 0x08) >> 3
        ]
    }
}
