const runButton = document.getElementById("start");
const stopButton = document.getElementById("stop");

// monitored values
const eta = document.getElementById("eta");
const frequency = document.getElementById("frequency");
const current = document.getElementById("current");
const voltage = document.getElementById("voltage");
const power = document.getElementById("power");
const torque = document.getElementById("torque");
const velocity = document.getElementById("velocity");

const refFrequency = document.getElementById("refFrequency");

refFrequency.value = 0;

const MAX_TORQUE = 4.98; // Nm
const MAX_POWER = 1500; // W
setInterval(() => {
  fetch("/api/v1/values").then((res) => {
    res.json().then((data) => {
      eta.innerHTML = "0x" + parseInt(data.eta).toString(16);
      frequency.innerHTML =
        parseInt(data.frequency) < 3000
          ? parseInt(data.frequency) / 10
          : (parseInt(data.frequency) - 65536) / 10;
      current.innerHTML = parseInt(data.current) / 100;
      voltage.innerHTML = data.voltage;
      power.innerHTML = ((parseInt(data.power) * MAX_POWER) / 100).toFixed(0);
      torque.innerHTML = ((parseInt(data.torque) * MAX_TORQUE) / 1000).toFixed(
        2
      );
      velocity.innerHTML =
        data.velocity < 30000 ? data.velocity : Math.abs(data.velocity - 65536);

      // refFrequency.value =
      //   parseInt(data.refFrequency) < 3000
      //     ? parseInt(data.refFrequency) / 10
      //     : (parseInt(data.refFrequency) - 65536) / 10;
    });
  });
}, 1000);

runButton.addEventListener("click", () => {
  fetch("/api/v1/run", {
    method: "POST",
  });
});

stopButton.addEventListener("click", () => {
  fetch("/api/v1/stop", {
    method: "POST",
  });
});

// on change focus out
refFrequency.addEventListener("focusout", () => {
  refFrequency.value = Math.min(Math.max(refFrequency.value, -50), 50);
  // set ref frequency to value
  // refFrequency.

  fetch("/api/v1/set-frequency", {
    method: "POST",
    body: JSON.stringify({
      value: refFrequency.value * 10,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
});
