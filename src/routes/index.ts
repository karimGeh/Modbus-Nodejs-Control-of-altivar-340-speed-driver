import express from "express";

//* routers

const router = express.Router();

const getSecondByteOfNumber = (number: number) => {
  const hexValue = number.toString(16);
  const startingIndex = hexValue.length - 2;
  return hexValue.slice(startingIndex);
};
router.post("/set-eta", async (req, res) => {
  const { value } = req.body;
  const resp = await global.client.writeSingleRegister(
    global.registers.eta,
    value
  );
  return res.send(resp);
});

router.post("/run", async (req, res) => {
  // send 0x0006 to 8501
  // wait for second byte of eta to be equal to 0x0031
  // send 0x0007 to 8501
  // wait for second byte of eta to be equal to 0x0033
  // send 0x000F to 8501
  // wait for second byte of eta to be equal to 0x0037
  res.send({
    success: true,
  });

  if (getSecondByteOfNumber(global.eta) == "37") {
    return;
  }
  if (
    getSecondByteOfNumber(global.eta) != "33" &&
    getSecondByteOfNumber(global.eta) != "37"
  ) {
    await global.client.writeSingleRegister(global.registers.cmd, 0x0006);
    console.log(getSecondByteOfNumber(global.eta));

    while (getSecondByteOfNumber(global.eta) != "31") {
      console.log("waiting for 31");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  if (getSecondByteOfNumber(global.eta) != "33") {
    await global.client.writeSingleRegister(global.registers.cmd, 0x0007);
    while (getSecondByteOfNumber(global.eta) != "33") {
      console.log("waiting for 33");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  await global.client.writeSingleRegister(global.registers.cmd, 0x000f);
  while (getSecondByteOfNumber(global.eta) != "37") {
    console.log("waiting for 37");
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
});

router.post("/stop", async (req, res) => {
  res.send({
    success: true,
  });
  await global.client.writeSingleRegister(global.registers.cmd, 0x0007);
  // while (getSecondByteOfNumber(global.eta) != "33") {
  //   console.log("waiting for 33");
  //   await new Promise((resolve) => setTimeout(resolve, 1000));
  // }
  // await global.client.writeSingleRegister(global.registers.cmd, 0x0000);
  // while (getSecondByteOfNumber(global.eta) != "33") {
  //   console.log("waiting for 33");
  //   await new Promise((resolve) => setTimeout(resolve, 1000));
  // }
});

router.post("/set-frequency", async (req, res) => {
  let { value } = req.body;
  // console.log({ value });

  value = parseInt(value);

  if (value < 0) {
    // 2 full bytes minus the value
    value = 65536 + value;
  }

  const resp = await global.client.writeSingleRegister(
    global.registers.refFrequency,
    value
  );
  return res.send(resp);
});

router.post("/set-cmd", async (req, res) => {
  let { value } = req.body;
  value = parseInt(value);

  const resp = await global.client.writeSingleRegister(
    global.registers.cmd,
    value
  );

  return res.send(resp);
});

router.get("/values", async (req, res) => {
  res.send({
    cmd: global.cmd,
    refFrequency: global.refFrequency,
    velocity: global.velocity,

    eta: global.eta,
    frequency: global.frequency,
    current: global.current,
    torque: global.torque,
    voltage: global.voltage,
    power: global.power,
  });
});

//!
//!
//!
//!
//! common routes
router.get("/status", async (_, res) => {
  return res.send("server up and running ✔✔");
});

export { router as mainRouter };
