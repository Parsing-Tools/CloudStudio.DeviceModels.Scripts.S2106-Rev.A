// Test:  01 0110 72650000 01 0a10 8f1a0000 e191
// Para testear battery: 00070064000500010610B45F0000010710A41F00003259
// https://files.seeedstudio.com/products/SenseCAP/S210X/SenseCAP%20S210X%20LoRaWAN%20Sensor%20User%20Guide.pdf

function parseUplink(device, payload) {
    var payloadb = payload.asBytes();
    var decoded = Decoder( payloadb, payload.port);
    env.log(decoded);

    decoded.messages.forEach(function (message) {
        switch (message.type) {
            case 'report_telemetry':
                switch (message.measurementId) {
                    case 4097: // Temperature
                        var sensor1 = device.endpoints.byAddress("1");
                        if (sensor1 != null)
                            sensor1.updateTemperatureSensorStatus(message.measurementValue);
                        break;
                    case 4106: // ph
                        var sensor2 = device.endpoints.byAddress("2");
                        if (sensor2 != null)
                            sensor2.updateGenericSensorStatus(message.measurementValue);
                        break;
                    // Add more cases for other measurement types if needed
                }
                break;
            case 'upload_battery':
                device.updateDeviceBattery({ percentage: message.battery });

                                // You can access the battery level using message.battery
                break;
            case 'upload_interval':
                // Handle upload_interval
                // You can access the interval using message.interval
                break;
            case 'upload_version':
                // Handle upload_version
                // You can access hardwareVersion and softwareVersion using message.hardwareVersion and message.softwareVersion
                break;
            case 'report_remove_sensor':
                // Handle report_remove_sensor
                // You can access the channel using message.channel
                break;
            default:
                // Handle unknown message type
                break;
        }
    });
}


function buildDownlink(device, endpoint, command, payload) {
    // This function allows you to convert a command from the platform 
    // into a payload to be sent to the device.
    // Learn more at https://wiki.cloud.studio/page/200

    // The parameters in this function are:
    // - device: object representing the device to which the command will
    //   be sent. 
    // - endpoint: endpoint object representing the endpoint to which the 
    //   command will be sent. May be null if the command is to be sent to 
    //   the device, and not to an individual endpoint within the device.
    // - command: object containing the command that needs to be sent. More
    //   information at https://wiki.cloud.studio/page/1195.

    // This example is written assuming a device that contains a single endpoint, 
    // of type appliance, that can be turned on, off, and toggled. 
    // It is assumed that a single byte must be sent in the payload, 
    // which indicates the type of operation.

    /*
         payload.port = 25; 	 	 // This device receives commands on LoRaWAN port 25 
         payload.buildResult = downlinkBuildResult.ok; 
    
         switch (command.type) { 
               case commandType.onOff: 
                       switch (command.onOff.type) { 
                               case onOffCommandType.turnOn: 
                                       payload.setAsBytes([30]); 	 	 // Command ID 30 is "turn on" 
                                       break; 
                               case onOffCommandType.turnOff: 
                                       payload.setAsBytes([31]); 	 	 // Command ID 31 is "turn off" 
                                       break; 
                               case onOffCommandType.toggle: 
                                       payload.setAsBytes([32]); 	 	 // Command ID 32 is "toggle" 
                                       break; 
                               default: 
                                       payload.buildResult = downlinkBuildResult.unsupported; 
                                       break; 
                       } 
                       break; 
               default: 
                       payload.buildResult = downlinkBuildResult.unsupported; 
                       break; 
         }
    */

}

/**
 * SenseCAP & TTN Converter
 *
 * @since 1.0
 * @return Object
 *      @param  Boolean     valid       Indicates whether the payload is a valid payload.
 *      @param  String      err         The reason for the payload to be invalid. 0 means valid, minus means invalid.
 *      @param  String      payload     Hexadecimal string, to show the payload.
 *      @param  Array       messages    One or more messages are parsed according to payload.
 *                              type // Enum:
 *                                   //   - "report_telemetry"
 *                                   //   - "upload_battery"
 *                                   //   - "upload_interval"
 *                                   //   - "upload_version"
 *                                   //   - "upload_sensor_id"
 *                                   //   - "report_remove_sensor"
 *                                   //   - "unknown_message"
 *
 *
 *
 *
 *  @sample-1
 *      var sample = Decoder(["00", "00", "00", "01", "01", "00", "01", "00", "07", "00", "64", "00", "3C", "00", "01", "20", "01", "00", "00", "00", "00", "28", "90"], null);
 *      {
 *        valid: true,
 *        err: 0,
 *        payload: '0000000101000100070064003C00012001000000002890',
 *        messages: [
 *           { type: 'upload_version',
 *             hardwareVersion: '1.0',
 *             softwareVersion: '1.1' },
 *           { type: 'upload_battery', battery: 100 },
 *           { type: 'upload_interval', interval: 3600 },
 *           { type: 'report_remove_sensor', channel: 1 }
 *        ]
 *      }
 * @sample-2
 *      var sample = Decoder(["01", "01", "10", "98", "53", "00", "00", "01", "02", "10", "A8", "7A", "00", "00", "AF", "51"], null);
 *      {
 *        valid: true,
 *        err: 0,
 *        payload: '01011098530000010210A87A0000AF51',
 *        messages: [
 *           { type: 'report_telemetry',
 *             measurementId: 4097,
 *             measurementValue: 21.4 },
 *           { type: 'report_telemetry',
 *             measurementId: 4098,
 *             measurementValue: 31.4 }
 *        ]
 *      }
 * @sample-3
 *      var sample = Decoder(["01", "01", "00", "01", "01", "00", "01", "01", "02", "00", "6A", "01", "00", "15", "01", "03", "00", "30", "F1", "F7", "2C", "01", "04", "00", "09", "0C", "13", "14", "01", "05", "00", "7F", "4D", "00", "00", "01", "06", "00", "00", "00", "00", "00", "4C", "BE"], null);
 *      {
 *        valid: true,
 *        err: 0,
 *        payload: '010100010100010102006A01001501030030F1F72C010400090C13140105007F4D0000010600000000004CBE',
 *        messages: [
 *            { type: 'upload_sensor_id', sensorId: '30F1F72C6A010015', channel: 1 }
 *        ]
 *      }
 */


/**
 * Entry, decoder.js
 */
function Decoder(bytes, port) {
    // init
    var bytesString = bytes2HexString(bytes)
        .toLocaleUpperCase();
    var decoded = {
        // valid
        valid: true,
        err: 0,
        // bytes
        payload: bytesString,
        // messages array
        messages: []
    };

    // CRC check
    if (!crc16Check(bytesString)) {
        decoded["valid"] = false;
        decoded["err"] = -1; // "crc check fail."
        return decoded;
    }

    // Length Check
    if ((((bytesString.length / 2) - 2) % 7) !== 0) {
        decoded["valid"] = false;
        decoded["err"] = -2; // "length check fail."
        return decoded;
    }

    // Cache sensor id
    var sensorEuiLowBytes;
    var sensorEuiHighBytes;

    // Handle each frame
    var frameArray = divideBy7Bytes(bytesString);
    for (var forFrame = 0; forFrame < frameArray.length; forFrame++) {
        var frame = frameArray[forFrame];
        // Extract key parameters
        var channel = strTo10SysNub(frame.substring(0, 2));
        var dataID = strTo10SysNub(frame.substring(2, 6));
        var dataValue = frame.substring(6, 14);
        var realDataValue = isSpecialDataId(dataID) ? ttnDataSpecialFormat(dataID, dataValue) : ttnDataFormat(dataValue);

        if (checkDataIdIsMeasureUpload(dataID)) {
            // if telemetry.
            decoded.messages.push({
                type: "report_telemetry",
                measurementId: dataID,
                measurementValue: realDataValue
            });
        } else if (isSpecialDataId(dataID) || (dataID === 5) || (dataID === 6)) {
            // if special order, except "report_sensor_id".
            switch (dataID) {
                case 0x00:
                    // node version
                    var versionData = sensorAttrForVersion(realDataValue);
                    decoded.messages.push({
                        type: "upload_version",
                        hardwareVersion: versionData.ver_hardware,
                        softwareVersion: versionData.ver_software
                    });
                    break;
                case 1:
                    // sensor version
                    break;
                case 2:
                    // sensor eui, low bytes
                    sensorEuiLowBytes = realDataValue;
                    break;
                case 3:
                    // sensor eui, high bytes
                    sensorEuiHighBytes = realDataValue;
                    break;
                case 7:
                    // battery power && interval
                    decoded.messages.push({
                        type: "upload_battery",
                        battery: realDataValue.power
                    }, {
                        type: "upload_interval",
                        interval: parseInt(realDataValue.interval) * 60
                    });
                    break;
                case 0x120:
                    // remove sensor
                    decoded.messages.push({
                        type: "report_remove_sensor",
                        channel: 1
                    });
                    break;
                default:
                    break;
            }
        } else {
            decoded.messages.push({
                type: "unknown_message",
                dataID: dataID,
                dataValue: dataValue
            });
        }

    }

    // if the complete id received, as "upload_sensor_id"
    if (sensorEuiHighBytes && sensorEuiLowBytes) {
        decoded.messages.unshift({
            type: "upload_sensor_id",
            channel: 1,
            sensorId: (sensorEuiHighBytes + sensorEuiLowBytes).toUpperCase()
        });
    }

    // return
    return decoded;
}

function crc16Check(data) {
    var crc16tab = [
        0x0000, 0x1189, 0x2312, 0x329b, 0x4624, 0x57ad, 0x6536, 0x74bf,
        0x8c48, 0x9dc1, 0xaf5a, 0xbed3, 0xca6c, 0xdbe5, 0xe97e, 0xf8f7,
        0x1081, 0x0108, 0x3393, 0x221a, 0x56a5, 0x472c, 0x75b7, 0x643e,
        0x9cc9, 0x8d40, 0xbfdb, 0xae52, 0xdaed, 0xcb64, 0xf9ff, 0xe876,
        0x2102, 0x308b, 0x0210, 0x1399, 0x6726, 0x76af, 0x4434, 0x55bd,
        0xad4a, 0xbcc3, 0x8e58, 0x9fd1, 0xeb6e, 0xfae7, 0xc87c, 0xd9f5,
        0x3183, 0x200a, 0x1291, 0x0318, 0x77a7, 0x662e, 0x54b5, 0x453c,
        0xbdcb, 0xac42, 0x9ed9, 0x8f50, 0xfbef, 0xea66, 0xd8fd, 0xc974,
        0x4204, 0x538d, 0x6116, 0x709f, 0x0420, 0x15a9, 0x2732, 0x36bb,
        0xce4c, 0xdfc5, 0xed5e, 0xfcd7, 0x8868, 0x99e1, 0xab7a, 0xbaf3,
        0x5285, 0x430c, 0x7197, 0x601e, 0x14a1, 0x0528, 0x37b3, 0x263a,
        0xdecd, 0xcf44, 0xfddf, 0xec56, 0x98e9, 0x8960, 0xbbfb, 0xaa72,
        0x6306, 0x728f, 0x4014, 0x519d, 0x2522, 0x34ab, 0x0630, 0x17b9,
        0xef4e, 0xfec7, 0xcc5c, 0xddd5, 0xa96a, 0xb8e3, 0x8a78, 0x9bf1,
        0x7387, 0x620e, 0x5095, 0x411c, 0x35a3, 0x242a, 0x16b1, 0x0738,
        0xffcf, 0xee46, 0xdcdd, 0xcd54, 0xb9eb, 0xa862, 0x9af9, 0x8b70,
        0x8408, 0x9581, 0xa71a, 0xb693, 0xc22c, 0xd3a5, 0xe13e, 0xf0b7,
        0x0840, 0x19c9, 0x2b52, 0x3adb, 0x4e64, 0x5fed, 0x6d76, 0x7cff,
        0x9489, 0x8500, 0xb79b, 0xa612, 0xd2ad, 0xc324, 0xf1bf, 0xe036,
        0x18c1, 0x0948, 0x3bd3, 0x2a5a, 0x5ee5, 0x4f6c, 0x7df7, 0x6c7e,
        0xa50a, 0xb483, 0x8618, 0x9791, 0xe32e, 0xf2a7, 0xc03c, 0xd1b5,
        0x2942, 0x38cb, 0x0a50, 0x1bd9, 0x6f66, 0x7eef, 0x4c74, 0x5dfd,
        0xb58b, 0xa402, 0x9699, 0x8710, 0xf3af, 0xe226, 0xd0bd, 0xc134,
        0x39c3, 0x284a, 0x1ad1, 0x0b58, 0x7fe7, 0x6e6e, 0x5cf5, 0x4d7c,
        0xc60c, 0xd785, 0xe51e, 0xf497, 0x8028, 0x91a1, 0xa33a, 0xb2b3,
        0x4a44, 0x5bcd, 0x6956, 0x78df, 0x0c60, 0x1de9, 0x2f72, 0x3efb,
        0xd68d, 0xc704, 0xf59f, 0xe416, 0x90a9, 0x8120, 0xb3bb, 0xa232,
        0x5ac5, 0x4b4c, 0x79d7, 0x685e, 0x1ce1, 0x0d68, 0x3ff3, 0x2e7a,
        0xe70e, 0xf687, 0xc41c, 0xd595, 0xa12a, 0xb0a3, 0x8238, 0x93b1,
        0x6b46, 0x7acf, 0x4854, 0x59dd, 0x2d62, 0x3ceb, 0x0e70, 0x1ff9,
        0xf78f, 0xe606, 0xd49d, 0xc514, 0xb1ab, 0xa022, 0x92b9, 0x8330,
        0x7bc7, 0x6a4e, 0x58d5, 0x495c, 0x3de3, 0x2c6a, 0x1ef1, 0x0f78
    ];
    var result = false;
    var crc = 0;
    var dataArray = [];
    for (var i = 0; i < data.length; i += 2) {
        dataArray.push(data.substring(i, i + 2));
    }

    for (var j = 0; j < dataArray.length; j++) {
        var item = dataArray[j];
        crc = (crc >> 8) ^ crc16tab[(crc ^ parseInt(item, 16)) & 0xFF];
    }
    if (crc === 0) {
        result = true;
    }
    return result;
}

// util
function bytes2HexString(arrBytes) {
    var str = "";
    for (var i = 0; i < arrBytes.length; i++) {
        var tmp;
        var num = arrBytes[i];
        if (num < 0) {
            tmp = (255 + num + 1).toString(16);
        } else {
            tmp = num.toString(16);
        }
        if (tmp.length === 1) {
            tmp = "0" + tmp;
        }
        str += tmp;
    }
    return str;
}

// util
function divideBy7Bytes(str) {
    var frameArray = [];
    for (var i = 0; i < str.length - 4; i += 14) {
        var data = str.substring(i, i + 14);
        frameArray.push(data);
    }
    return frameArray;
}

// util
function littleEndianTransform(data) {
    var dataArray = [];
    for (var i = 0; i < data.length; i += 2) {
        dataArray.push(data.substring(i, i + 2));
    }
    dataArray.reverse();
    return dataArray;
}

// util
function strTo10SysNub(str) {
    var arr = littleEndianTransform(str);
    return parseInt(arr.toString()
        .replace(/,/g, ""), 16);
}

// util
function checkDataIdIsMeasureUpload(dataId) {
    return parseInt(dataId) > 4096;
}

// configurable.
function isSpecialDataId(dataID) {
    switch (dataID) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 7:
        case 0x120:
            return true;
        default:
            return false;
    }
}

// configurable
function ttnDataSpecialFormat(dataId, str) {
    var strReverse = littleEndianTransform(str);
    if (dataId === 2 || dataId === 3) {
        return strReverse.join("");
    }

    // handle unsigned number
    var str2 = toBinary(strReverse);

    var dataArray = [];
    switch (dataId) {
        case 0: // DATA_BOARD_VERSION
        case 1: // DATA_SENSOR_VERSION
            // Using point segmentation
            for (var k = 0; k < str2.length; k += 16) {
                var tmp146 = str2.substring(k, k + 16);
                tmp146 = (parseInt(tmp146.substring(0, 8), 2) || 0) + "." + (parseInt(tmp146.substring(8, 16), 2) || 0);
                dataArray.push(tmp146);
            }
            return dataArray.join(",");
        case 4:
            for (var i = 0; i < str2.length; i += 8) {
                var item = parseInt(str2.substring(i, i + 8), 2);
                if (item < 10) {
                    item = "0" + item.toString();
                } else {
                    item = item.toString();
                }
                dataArray.push(item);
            }
            return dataArray.join("");
        case 7:
            // battery && interval
            return {
                interval: parseInt(str2.substr(0, 16), 2),
                power: parseInt(str2.substr(-16, 16), 2)
            };
    }
}

// util
function ttnDataFormat(str) {
    var strReverse = littleEndianTransform(str);
    var str2 = toBinary(strReverse);
    if (str2.substring(0, 1) === "1") {
        var arr = str2.split("");
        var reverseArr = [];
        for (var forArr = 0; forArr < arr.length; forArr++) {
            var item = arr[forArr];
            if (parseInt(item) === 1) {
                reverseArr.push(0);
            } else {
                reverseArr.push(1);
            }
        }
        str2 = parseInt(reverseArr.join(""), 2) + 1;
        return parseFloat("-" + str2 / 1000);
    }
    return parseInt(str2, 2) / 1000;
}

// util
function sensorAttrForVersion(dataValue) {
    var dataValueSplitArray = dataValue.split(",");
    return {
        ver_hardware: dataValueSplitArray[0],
        ver_software: dataValueSplitArray[1]
    };
}

// util
function toBinary(arr) {
    var binaryData = [];
    for (var forArr = 0; forArr < arr.length; forArr++) {
        var item = arr[forArr];
        var data = parseInt(item, 16)
            .toString(2);
        var dataLength = data.length;
        if (data.length !== 8) {
            for (var i = 0; i < 8 - dataLength; i++) {
                data = "0" + data;
            }
        }
        binaryData.push(data);
    }
    return binaryData.toString()
        .replace(/,/g, "");
}

// Samples
// var sample = Decoder(["00", "00", "00", "01", "01", "00", "01", "00", "07", "00", "64", "00", "3C", "00", "01", "20", "01", "00", "00", "00", "00", "28", "90"], null);
// var sample = Decoder(["01", "01", "10", "98", "53", "00", "00", "01", "02", "10", "A8", "7A", "00", "00", "AF", "51"], null);
// var sample = Decoder(["01", "01", "00", "01", "01", "00", "01", "01", "02", "00", "6A", "01", "00", "15", "01", "03", "00", "30", "F1", "F7", "2C", "01", "04", "00", "09", "0C", "13", "14", "01", "05", "00", "7F", "4D", "00", "00", "01", "06", "00", "00", "00", "00", "00", "4C", "BE"], null);
// console.log(sample);