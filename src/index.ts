// import dotenv from "dotenv";
import * as Modbus from "jsmodbus";
import net from "net";
import app from "./app";

import { scheduleJob } from "node-schedule";
// import { ioScanner } from "./ioScanner";
// import { removeNonConfirmedAds } from "./utils/removeNonConfirmedAds";

// dotenv.config();

// namespace global {
//   export let cmd: number = 0;
//   export let refFrequency: number = 0;
//   export let velocity: number = 0;

//   export let eta: number = 0;
//   export let frequency: number = 0;
//   export let current: number = 0;
//   export let torque: number = 0;
//   export let voltage: number = 0;
//   export let power: number = 0;
//   export let client: Modbus.ModbusTCPClient;
// }
declare global {
  namespace NodeJS {
    interface Global {
      cmd: number;
      refFrequency: number;
      velocity: number;

      eta: number;
      frequency: number;
      current: number;
      torque: number;
      voltage: number;
      power: number;
      client: Modbus.ModbusTCPClient;

      registers: {
        [key: string]: number;
      };
    }
  }
}
// registers
const registers = {
  // 8500
  cmd: 8501,
  refFrequency: 8502,
  velocity: 8604,

  // 3000
  eta: 3201,
  frequency: 3202,
  current: 3204,
  torque: 3205,
  voltage: 3208,
  power: 3211,
};
global.registers = registers;

const start = async () => {
  console.clear();
  console.log("Starting...");

  const options = {
    host: "192.168.1.70",
    port: 502,
  };

  // starting app schedule
  // removeNonConfirmedAds();
  // schedule a job to run every second
  const socket = new net.Socket();
  const client = new Modbus.client.TCP(socket, 248);
  global.client = client;

  socket.on("connect", () => {
    console.log("connected");
    // client.writeSingleRegister(global.registers.cmd, 0x0000);
    // client
    //   .readHoldingRegisters(3201, 125)
    //   .then(function (res) {
    //     console.log({ eta: res.response.body.valuesAsArray[0].toString(16) });
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });

    setInterval(
      () => {
        console.log("reading");
        client
          .readHoldingRegisters(8501, 125)
          .then(function (res) {
            global.cmd = res.response.body.valuesAsArray[0];
            global.refFrequency = res.response.body.valuesAsArray[1];
            global.velocity = res.response.body.valuesAsArray[103];

            console.log({
              cmd: global.cmd.toString(16),
              refFrequency: global.refFrequency,
              velocity: global.velocity,
            });
          })
          .catch((err) => {
            console.log(err);
          });
        client
          .readHoldingRegisters(3201, 125)
          .then(function (res) {
            console.log({
              eta: res.response.body.valuesAsArray[0].toString(16),
            });

            global.eta = res.response.body.valuesAsArray[0];
            global.frequency = res.response.body.valuesAsArray[1];
            global.current = res.response.body.valuesAsArray[3];
            global.torque = res.response.body.valuesAsArray[4];
            global.voltage = res.response.body.valuesAsArray[7];
            global.power = res.response.body.valuesAsArray[10];
          })
          .catch((err) => {
            console.log(err);
          });
      },
      1000 // 500ms
    );
  });

  socket.connect(options);

  // client.connectTCP(process.env.MODBUS_IP, 502);
  // client.connect(502, "127.0.0.1");

  // scheduleJob("* * * * * *", async (fireDate) => {});
  // scheduleJob("*/5 * * * *", removeNonConfirmedAds);

  // starting app
  const port = 5000;
  app.listen(port, () => {
    console.log(`SERVER UP AND LISTENING ON PORT ${port}!`);
    console.log(`server status : GET http://127.0.0.1:${port}/api/v1/status`);
  });
};

start();
