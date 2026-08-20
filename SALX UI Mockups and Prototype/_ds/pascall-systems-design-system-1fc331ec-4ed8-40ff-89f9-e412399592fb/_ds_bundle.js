/* @ds-bundle: {"format":4,"namespace":"PascallSystemsDesignSystem_1fc331","components":[],"sourceHashes":{"ui_kits/m0_display/Components.jsx":"dbb58e8d3db0","ui_kits/m0_display/Screens.jsx":"757a56e3564e","ui_kits/m0_display/Visuals.jsx":"6a321066b9af","ui_kits/pminds/Components.jsx":"1adf7fdc5800","ui_kits/pminds/Screens.jsx":"6542f2851dc6"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.PascallSystemsDesignSystem_1fc331 = window.PascallSystemsDesignSystem_1fc331 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/m0_display/Components.jsx
try { (() => {
const {
  useState,
  useEffect,
  useRef
} = React;

// ---------- Status bar ----------
function StatusBar({
  patientAge = 42,
  version = "1.3.74"
}) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const pad = n => String(n).padStart(2, "0");
  const date = now.toDateString().split(" ").slice(1).join(" ");
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  return /*#__PURE__*/React.createElement("div", {
    className: "m0-statusbar"
  }, /*#__PURE__*/React.createElement(BatteryIcon, {
    level: 0.7
  }), /*#__PURE__*/React.createElement("span", {
    className: "readout",
    style: {
      fontSize: 20,
      color: "#fff"
    }
  }, date), /*#__PURE__*/React.createElement("span", {
    className: "readout",
    style: {
      fontSize: 20,
      color: "#fff"
    }
  }, time), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "#c7c7c7"
    }
  }, "v ", version), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "m0-statusbar__group"
  }, /*#__PURE__*/React.createElement("span", null, "Sensor"), /*#__PURE__*/React.createElement(BatteryIcon, {
    level: 0.45,
    fill: "#FFCC8A"
  })), /*#__PURE__*/React.createElement("div", {
    className: "m0-statusbar__group"
  }, /*#__PURE__*/React.createElement("span", null, "Patient's Age"), /*#__PURE__*/React.createElement("span", {
    className: "readout",
    style: {
      color: "#FFCC8A",
      fontSize: 22
    }
  }, patientAge)));
}
function BatteryIcon({
  level = 1,
  fill = "#fff"
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "36",
    viewBox: "0 0 14 28",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "13",
    height: "27",
    stroke: fill
  }), /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: 3 + 22 * (1 - level),
    width: "8",
    height: 22 * level,
    fill: fill
  }));
}

// ---------- Button ----------
function Button({
  variant = "primary",
  disabled,
  children,
  onClick,
  size = "md",
  style
}) {
  const base = {
    fontFamily: "Roboto, sans-serif",
    fontWeight: 500,
    border: 0,
    cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: 3,
    letterSpacing: 0.2,
    transition: "background 120ms",
    height: size === "lg" ? 60 : 48,
    fontSize: size === "lg" ? 20 : 16,
    padding: size === "lg" ? "0 28px" : "0 20px"
  };
  const variants = {
    primary: {
      background: disabled ? "#C3C3C3" : "#EC8D00",
      color: "#fff"
    },
    secondary: {
      background: "#fff",
      color: "#000",
      border: "1px solid #707070"
    },
    danger: {
      background: "#fff",
      color: "#CC0C00",
      border: "1px solid #CC0C00"
    },
    pause: {
      background: "#FF7700",
      color: "#fff"
    },
    neutral: {
      background: "#B0B0B0",
      color: "#fff"
    },
    link: {
      background: "transparent",
      color: "#316FAD",
      textDecoration: "underline",
      height: "auto",
      padding: 0
    }
  };
  return /*#__PURE__*/React.createElement("button", {
    disabled: disabled,
    onClick: onClick,
    style: {
      ...base,
      ...variants[variant],
      ...style
    }
  }, children);
}

// ---------- Signal dot ----------
function SignalDot({
  state = "good",
  label
}) {
  const colors = {
    good: "#00BA32",
    ok: "#EC8D00",
    bad: "#CC0C00",
    dead: "#CDCDCD"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      borderRadius: "50%",
      background: colors[state],
      display: "inline-block"
    }
  }), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, label));
}

// ---------- Toggle ----------
function Toggle({
  checked,
  onChange
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: () => onChange(!checked),
    style: {
      width: 46,
      height: 26,
      borderRadius: 999,
      border: 0,
      padding: 2,
      background: checked ? "#5C1FDA" : "#CCCCCC",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: checked ? "flex-end" : "flex-start",
      transition: "all 180ms"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "0 1px 2px rgba(0,0,0,0.3)"
    }
  }));
}

// ---------- Radio ----------
function Radio({
  checked,
  onChange,
  label
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      cursor: "pointer",
      fontSize: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      borderRadius: "50%",
      border: "2px solid #09869F",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: "#09869F"
    }
  })), /*#__PURE__*/React.createElement("input", {
    type: "radio",
    checked: checked,
    onChange: () => onChange(),
    style: {
      display: "none"
    }
  }), label);
}

// ---------- Numpad ----------
function Numpad({
  value,
  onChange,
  max = 3
}) {
  const press = k => {
    if (k === "back") onChange(value.slice(0, -1));else if (k === "clear") onChange("");else if (value.length < max) onChange(value + k);
  };
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "back", "0", "clear"];
  return /*#__PURE__*/React.createElement("div", {
    className: "m0-numpad"
  }, keys.map(k => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: "m0-numpad__key",
    style: {
      color: k === "back" || k === "clear" ? "#316FAD" : "#000"
    },
    onClick: () => press(k)
  }, k === "back" ? "Back" : k === "clear" ? "Clear" : k)));
}
Object.assign(window, {
  StatusBar,
  Button,
  SignalDot,
  Toggle,
  Radio,
  Numpad,
  BatteryIcon
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/m0_display/Components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/m0_display/Screens.jsx
try { (() => {
const {
  useState
} = React;

// ---------- Screens ----------
function ConnectingScreen({
  onConnect
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "m0-screen m0-screen--center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "m0-spinner"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 500,
      marginTop: 32
    }
  }, "Connecting to sensor\u2026"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: "#636363",
      marginTop: 8
    }
  }, "Performing sampling rate check."), /*#__PURE__*/React.createElement(Button, {
    variant: "link",
    style: {
      marginTop: 32
    },
    onClick: onConnect
  }, "Skip (demo)"));
}
function StartScreen({
  onStart,
  onSettings
}) {
  const [age, setAge] = useState("");
  const canStart = age.length > 0 && Number(age) > 0 && Number(age) < 120;
  return /*#__PURE__*/React.createElement("div", {
    className: "m0-screen",
    style: {
      padding: "32px 48px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 48
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 32,
      fontWeight: 700,
      margin: 0
    }
  }, "New Case"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      color: "#636363",
      marginTop: 12,
      maxWidth: 480
    }
  }, "Enter the patient's age and tap Start Case to begin monitoring. Verify channel impedance from the live view."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      letterSpacing: 0.02,
      color: "#636363",
      marginTop: 40,
      fontWeight: 500
    }
  }, "PATIENT'S AGE"), /*#__PURE__*/React.createElement("div", {
    className: "readout",
    style: {
      fontSize: 72,
      color: age ? "#EC8D00" : "#CCCCCC",
      lineHeight: 1
    }
  }, age || "—"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginTop: 48
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onSettings
  }, "Settings"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    disabled: !canStart,
    onClick: onStart
  }, "Start Case"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Numpad, {
    value: age,
    onChange: setAge
  })));
}
function LiveScreen({
  onStop,
  onImpedance
}) {
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  React.useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [paused]);
  const fmt = s => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor(s / 60) % 60).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "m0-screen"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 24,
      padding: "12px 24px",
      background: "#E2E2E2"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#636363",
      fontWeight: 500,
      letterSpacing: 0.02
    }
  }, "CASE ELAPSED"), /*#__PURE__*/React.createElement("div", {
    className: "readout",
    style: {
      fontSize: 28
    }
  }, fmt(elapsed)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(SignalDot, {
    state: "good",
    label: "R1"
  }), /*#__PURE__*/React.createElement(SignalDot, {
    state: "good",
    label: "R2"
  }), /*#__PURE__*/React.createElement(SignalDot, {
    state: "ok",
    label: "L1"
  }), /*#__PURE__*/React.createElement(SignalDot, {
    state: "dead",
    label: "L2"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "link",
    onClick: onImpedance
  }, "Check impedance")), /*#__PURE__*/React.createElement(Waveform, {
    running: !paused,
    height: 380
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "6px 24px",
      background: "#000",
      color: "#aaa",
      fontSize: 12,
      display: "flex",
      gap: 24,
      fontFamily: "DM Sans, sans-serif"
    }
  }, /*#__PURE__*/React.createElement("span", null, "Scale: 100 \xB5V"), /*#__PURE__*/React.createElement("span", null, "Sampling: 249.8 Hz"), /*#__PURE__*/React.createElement("span", null, "HP filter: 0.5 Hz"), /*#__PURE__*/React.createElement("span", null, "LP filter: 50 Hz")), /*#__PURE__*/React.createElement(Spectrogram, {
    height: 160
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 24px",
      display: "flex",
      gap: 12,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#636363",
      fontWeight: 500,
      letterSpacing: 0.02
    }
  }, "STATE OF ANESTHESIA"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "readout",
    style: {
      fontSize: 48,
      color: "#EC8D00"
    }
  }, paused ? "—" : "62"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: "#636363"
    }
  }, "index \xB7 moderate hypnosis"))), /*#__PURE__*/React.createElement(Button, {
    variant: paused ? "primary" : "pause",
    onClick: () => setPaused(p => !p)
  }, paused ? "Resume" : "Pause"), /*#__PURE__*/React.createElement(Button, {
    variant: "danger",
    onClick: onStop
  }, "Stop Case")));
}
function ImpedanceScreen({
  onBack
}) {
  const channels = [{
    name: "R1",
    state: "good",
    kohm: 3.1
  }, {
    name: "R2",
    state: "good",
    kohm: 4.2
  }, {
    name: "L1",
    state: "ok",
    kohm: 8.8
  }, {
    name: "L2",
    state: "bad",
    kohm: 18.4
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "m0-screen",
    style: {
      padding: 48
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 32,
      fontWeight: 700,
      margin: 0
    }
  }, "Check Channels Impedance"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      color: "#636363",
      marginTop: 8
    }
  }, "Good contact < 5 k\u03A9 \xB7 acceptable < 10 k\u03A9 \xB7 poor < 22 k\u03A9 \xB7 no contact \u2265 1 M\u03A9."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 16,
      marginTop: 32
    }
  }, channels.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.name,
    style: {
      border: "1px solid #CCCCCC",
      padding: 24,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(SignalDot, {
    state: c.state,
    label: /*#__PURE__*/React.createElement("strong", null, c.name)
  }), /*#__PURE__*/React.createElement("div", {
    className: "readout",
    style: {
      fontSize: 40,
      color: c.state === "bad" ? "#CC0C00" : "#000"
    }
  }, c.kohm.toFixed(1), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      color: "#636363",
      marginLeft: 6
    }
  }, "k\u03A9")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#636363",
      textTransform: "uppercase",
      letterSpacing: 0.04
    }
  }, c.state === "good" ? "Strong" : c.state === "ok" ? "Acceptable" : c.state === "bad" ? "Reposition" : "No contact")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40,
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onBack
  }, "Back to monitoring"), /*#__PURE__*/React.createElement(Button, {
    variant: "link",
    onClick: () => alert("Troubleshoot guide")
  }, "Troubleshoot")));
}
function SettingsScreen({
  onBack
}) {
  const [record, setRecord] = useState(true);
  const [eegRaw, setEegRaw] = useState(false);
  const [rate, setRate] = useState("250");
  return /*#__PURE__*/React.createElement("div", {
    className: "m0-screen",
    style: {
      padding: 48,
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 32,
      fontWeight: 700,
      margin: 0
    }
  }, "Settings"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement(SettingsRow, {
    title: "Record case data",
    subtitle: "Store de-identified EEG and index trend locally."
  }, /*#__PURE__*/React.createElement(Toggle, {
    checked: record,
    onChange: setRecord
  })), /*#__PURE__*/React.createElement(SettingsRow, {
    title: "Include raw EEG",
    subtitle: "Increases storage; needed for research export."
  }, /*#__PURE__*/React.createElement(Toggle, {
    checked: eegRaw,
    onChange: setEegRaw
  })), /*#__PURE__*/React.createElement(SettingsRow, {
    title: "Sampling rate"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 20
    }
  }, ["125", "250", "500"].map(r => /*#__PURE__*/React.createElement(Radio, {
    key: r,
    checked: rate === r,
    onChange: () => setRate(r),
    label: `${r} Hz`
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onBack
  }, "Back")));
}
function SettingsRow({
  title,
  subtitle,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      padding: "20px 0",
      borderBottom: "1px solid #F2F2F2",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 500
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#636363",
      marginTop: 2
    }
  }, subtitle)), children);
}
Object.assign(window, {
  ConnectingScreen,
  StartScreen,
  LiveScreen,
  ImpedanceScreen,
  SettingsScreen,
  SettingsRow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/m0_display/Screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/m0_display/Visuals.jsx
try { (() => {
const {
  useEffect,
  useRef
} = React;

// 4-channel EEG waveform on black, using channel colors from the design system.
function Waveform({
  running = true,
  height = 360
}) {
  const ref = useRef();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.clientWidth * devicePixelRatio;
    const H = canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const colors = ["#FF0000", "#0000FF", "#00BA32", "#FFFF00"];
    const labels = ["R1", "R2", "L1", "L2"];
    const rowH = canvas.clientHeight / 4;
    let t = 0;
    let raf;
    const seedSamples = 400;
    const buffers = colors.map(() => Array(seedSamples).fill(0).map(() => (Math.random() - 0.5) * 0.3));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      // grid
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.clientWidth; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.clientHeight);
        ctx.stroke();
      }
      colors.forEach((c, ci) => {
        const y0 = rowH * ci + rowH / 2;
        // label
        ctx.fillStyle = c;
        ctx.font = "600 12px Roboto, sans-serif";
        ctx.fillText(labels[ci], 8, rowH * ci + 16);
        // axis
        ctx.strokeStyle = "#F94B00";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, rowH * (ci + 1));
        ctx.lineTo(canvas.clientWidth, rowH * (ci + 1));
        ctx.stroke();
        // trace
        const buf = buffers[ci];
        if (running) {
          buf.shift();
          buf.push(Math.sin(t * 0.06 + ci) * 0.15 + Math.sin(t * 0.35 + ci * 2) * 0.1 + (Math.random() - 0.5) * 0.3);
        }
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i < buf.length; i++) {
          const x = i / buf.length * canvas.clientWidth;
          const y = y0 + buf[i] * rowH * 0.9;
          if (i === 0) ctx.moveTo(x, y);else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      t++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [running]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#000",
      height,
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: ref,
    style: {
      width: "100%",
      height: "100%",
      display: "block"
    }
  }));
}
function Spectrogram({
  height = 140
}) {
  const ref = useRef();
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const stops = ["#000090", "#0000FF", "#0080FF", "#00FFFF", "#80FF80", "#FFFF00", "#FF8000", "#FF0000", "#800000"];
    let col = 0;
    let raf;
    const tick = () => {
      const w = canvas.clientWidth,
        h = canvas.clientHeight;
      // scroll left
      const img = ctx.getImageData(1 * devicePixelRatio, 0, canvas.width - devicePixelRatio, canvas.height);
      ctx.putImageData(img, 0, 0);
      // draw new column
      const x = w - 1;
      for (let y = 0; y < h; y++) {
        const freq = y / h;
        const energy = (0.4 + 0.3 * Math.sin(col * 0.02 + freq * 8) + 0.3 * Math.random()) * (1 - freq * 0.6);
        const idx = Math.min(stops.length - 1, Math.max(0, Math.floor(energy * stops.length)));
        ctx.fillStyle = stops[idx];
        ctx.fillRect(x, y, 1, 1);
      }
      col++;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#000",
      height
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: ref,
    style: {
      width: "100%",
      height: "100%",
      display: "block"
    }
  }));
}
Object.assign(window, {
  Waveform,
  Spectrogram
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/m0_display/Visuals.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pminds/Components.jsx
try { (() => {
/* global React */
const {
  useState,
  useEffect,
  useRef
} = React;

/* =========================================================
   pMinds — Shared Components
   Recreation of Flutter widgets from pmind_game_new/lib
   ========================================================= */

/* ---------- Button (CustomPanDownButton) ---------- */
function PmButton({
  label,
  onClick,
  variant = 'primary',
  // 'primary' | 'teal' | 'green' | 'ghost'
  size = 'lg',
  // 'sm' | 'md' | 'lg' | 'xl'
  disabled = false,
  full = false,
  style = {}
}) {
  const [pressed, setPressed] = useState(false);
  const sizeMap = {
    sm: {
      padY: 12,
      padX: 28,
      fs: 20,
      r: 4
    },
    md: {
      padY: 16,
      padX: 40,
      fs: 28,
      r: 4
    },
    lg: {
      padY: 22,
      padX: 64,
      fs: 36,
      r: 4
    },
    xl: {
      padY: 28,
      padX: 96,
      fs: 44,
      r: 4
    }
  };
  const s = sizeMap[size];
  const variantStyles = {
    primary: {
      background: pressed ? 'linear-gradient(135deg, rgba(36,106,141,.7), rgba(16,56,76,.7))' : 'linear-gradient(135deg, #246A8D 0%, #10384C 100%)',
      color: '#FFFFFF'
    },
    teal: {
      background: pressed ? 'linear-gradient(135deg, rgba(55,128,136,.7), rgba(26,72,95,.7))' : 'linear-gradient(135deg, #378088 0%, #1A485F 100%)',
      color: '#FFFFFF'
    },
    green: {
      background: pressed ? 'rgba(217,224,164,.7)' : '#D9E0A4',
      color: '#19485F'
    },
    ghost: {
      background: 'transparent',
      color: '#19485F',
      border: '2px solid #19485F'
    }
  };
  return /*#__PURE__*/React.createElement("button", {
    onClick: disabled ? undefined : onClick,
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    onMouseLeave: () => setPressed(false),
    disabled: disabled,
    style: {
      ...variantStyles[variant],
      padding: `${s.padY}px ${s.padX}px`,
      fontSize: s.fs,
      fontFamily: "'AinslieSansNorm','Archivo',sans-serif",
      fontWeight: 700,
      letterSpacing: '0.01em',
      borderRadius: s.r,
      border: variantStyles[variant].border || 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      width: full ? '100%' : 'auto',
      transition: 'all 100ms ease-out',
      lineHeight: 1,
      ...style
    }
  }, label);
}

/* ---------- Input Field (patient information) ---------- */
function PmInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  icon
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      border: `2px solid #1A485F`,
      borderRadius: 8,
      padding: '14px 24px',
      background: '#ffffff',
      height: 72,
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value || '',
    onChange: e => onChange?.(e.target.value),
    placeholder: placeholder,
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: "'AinslieSansNorm','Archivo',sans-serif",
      fontSize: 26,
      fontWeight: value ? 700 : 300,
      color: '#19485F'
    }
  }), icon && /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#1A485F',
      opacity: 0.7
    }
  }, icon));
}

/* ---------- Progress Bar (with chevron-arrow on leading edge) ---------- */
function PmProgressBar({
  percent = 0,
  height = 32
}) {
  const arrowW = 12;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      height,
      background: '#ECE7E2'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100%',
      width: `${percent}%`,
      background: '#515E68',
      clipPath: `polygon(0 0, calc(100% - ${arrowW}px) 0, 100% 50%, calc(100% - ${arrowW}px) 100%, 0 100%)`
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 8,
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#FFFFFF',
      fontFamily: "'AinslieSansNorm','Archivo',sans-serif",
      fontSize: height * 0.58,
      fontWeight: 700,
      lineHeight: 1
    }
  }, Math.round(percent), "%"));
}

/* ---------- Header Bar (optional hamburger + progress) ---------- */
function PmHeaderBar({
  title,
  percent,
  onMenu
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%'
    }
  }, percent !== undefined && /*#__PURE__*/React.createElement(PmProgressBar, {
    percent: percent
  }), title && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #D6D5D3'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'AinslieSansNorm','Archivo',sans-serif",
      fontWeight: 700,
      fontSize: 22,
      color: '#19485F'
    }
  }, title), onMenu && /*#__PURE__*/React.createElement("button", {
    onClick: onMenu,
    style: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      color: '#19485F',
      fontFamily: "'AinslieSansNorm','Archivo',sans-serif",
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 22 22",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 6h16M3 11h16M3 16h16",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  })), "Menu")));
}

/* ---------- Divider (two-dot line from welcome screen) ---------- */
function PmDotDivider({
  width = 520,
  color = '#D6D5D3',
  dotColor = '#FFFFFF',
  dotR = 8
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: width,
    height: dotR * 3,
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("line", {
    x1: dotR,
    y1: "50%",
    x2: width - dotR,
    y2: "50%",
    stroke: color,
    strokeWidth: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: dotR,
    cy: "50%",
    r: dotR,
    fill: dotColor
  }), /*#__PURE__*/React.createElement("circle", {
    cx: width - dotR,
    cy: "50%",
    r: dotR,
    fill: dotColor
  }));
}

/* ---------- Radio (matches svg from repo, redrawn) ---------- */
function PmRadio({
  checked,
  onClick,
  size = 44
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      width: size,
      height: size,
      borderRadius: '50%',
      border: `3px solid #19485F`,
      background: '#FFFFFF',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      padding: 0
    }
  }, checked && /*#__PURE__*/React.createElement("div", {
    style: {
      width: size * 0.5,
      height: size * 0.5,
      borderRadius: '50%',
      background: '#19485F'
    }
  }));
}

/* ---------- Question Card (HADS / Frailty questionnaire) ---------- */
function PmQuestionCard({
  n,
  total,
  prompt,
  options,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.95)',
      borderRadius: 8,
      padding: '48px 64px',
      boxShadow: '0 5px 20px rgba(0,0,0,.08)',
      maxWidth: 1100,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'AinslieSansNormBook','Archivo',sans-serif",
      fontSize: 20,
      color: '#70858F',
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      marginBottom: 16
    }
  }, "Question ", n, " of ", total), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'AinslieSansNorm','Archivo',sans-serif",
      fontWeight: 700,
      fontSize: 32,
      color: '#19485F',
      lineHeight: 1.3,
      marginBottom: 40
    }
  }, prompt), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, options.map((opt, i) => /*#__PURE__*/React.createElement("label", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      padding: '18px 24px',
      borderRadius: 8,
      border: `2px solid ${value === i ? '#19485F' : '#D6D5D3'}`,
      background: value === i ? '#F5F7F9' : '#FFFFFF',
      cursor: 'pointer',
      fontFamily: "'AinslieSansNorm','Archivo',sans-serif",
      fontSize: 24,
      color: '#19485F'
    },
    onClick: () => onChange(i)
  }, /*#__PURE__*/React.createElement(PmRadio, {
    checked: value === i,
    size: 36
  }), /*#__PURE__*/React.createElement("span", null, opt)))));
}

/* ---------- Number button (from Counting Span / Digit Span) ---------- */
function PmNumberButton({
  n,
  onClick,
  tone = 'teal',
  size = 96
}) {
  const tones = {
    teal: {
      bg: '#FFFFFF',
      color: '#19485F',
      border: '2px solid #19485F'
    },
    filled: {
      bg: '#246A8D',
      color: '#FFFFFF',
      border: 'none'
    },
    green: {
      bg: '#D9E0A4',
      color: '#19485F',
      border: '2px solid #D9E0A4'
    }
  };
  const t = tones[tone];
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      width: size,
      height: size,
      borderRadius: 8,
      background: t.bg,
      color: t.color,
      border: t.border,
      fontFamily: "'AinslieSansNorm','Archivo',sans-serif",
      fontSize: size * 0.5,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, n);
}

/* ---------- Game Tile (used on TestOverview second page + SecretMenu) ---------- */
function PmGameTile({
  logo,
  label,
  onClick,
  active = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      width: 240,
      height: 240,
      background: active ? '#D9E0A4' : 'rgba(255,255,255,0.08)',
      border: active ? 'none' : '2px solid rgba(255,255,255,0.25)',
      borderRadius: 12,
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 18,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 120,
      height: 120,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, logo ? /*#__PURE__*/React.createElement("img", {
    src: logo,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'contain'
    }
  }) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'AinslieSansNorm','Archivo',sans-serif",
      fontWeight: 700,
      fontSize: 20,
      color: active ? '#19485F' : '#FFFFFF',
      textAlign: 'center',
      lineHeight: 1.2
    }
  }, label));
}

/* Export */
Object.assign(window, {
  PmButton,
  PmInput,
  PmProgressBar,
  PmHeaderBar,
  PmDotDivider,
  PmRadio,
  PmQuestionCard,
  PmNumberButton,
  PmGameTile
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pminds/Components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pminds/Screens.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */
const {
  useState: useStateS,
  useEffect: useEffectS
} = React;

/* =========================================================
   pMinds — Screens
   Matches the Flutter flow:
   Welcome → StartNewCase → PatientInfo → TestOverview (3 pages) →
   Games (DigitSpan, VerbalFluency, etc.) → End
   ========================================================= */

const ASSETS = 'assets/';

/* ---------------- WELCOME (splash) ---------------- */
function WelcomeScreen({
  onContinue
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      background: '#19495F',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 120,
      position: 'relative',
      cursor: 'pointer'
    },
    onClick: onContinue
  }, /*#__PURE__*/React.createElement("img", {
    src: ASSETS + 'pmind-logo.svg',
    alt: "pMinds",
    style: {
      width: 280,
      height: 260,
      marginBottom: 40,
      filter: 'drop-shadow(0 6px 12px rgba(0,0,0,.3))'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'AinslieSansNorm','Archivo',sans-serif",
      fontWeight: 800,
      fontSize: 120,
      color: '#D9E0A4',
      lineHeight: 1,
      letterSpacing: '-0.02em'
    }
  }, "pMinds"), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '32px 0'
    }
  }, /*#__PURE__*/React.createElement(PmDotDivider, {
    width: 520,
    color: "#D6D5D3",
    dotColor: "#FFFFFF",
    dotR: 6
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'AinslieSansNormBook','Archivo',sans-serif",
      fontSize: 28,
      color: 'rgba(255,255,255,0.9)',
      textAlign: 'center',
      maxWidth: 720,
      lineHeight: 1.5,
      fontWeight: 400
    }
  }, "A suite of cognitive games and brief questionnaires for assessing", /*#__PURE__*/React.createElement("br", null), "attention, memory, executive function, and mood."), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 60,
      left: 0,
      right: 0,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'AinslieSansNorm','Archivo',sans-serif",
      fontSize: 22,
      color: 'rgba(255,255,255,0.6)',
      fontWeight: 400
    }
  }, "Pascall Systems, Inc.")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 20,
      right: 24,
      fontFamily: "'AinslieSansNormBook','Archivo',sans-serif",
      fontSize: 14,
      color: 'rgba(255,255,255,0.35)'
    }
  }, "Tap anywhere to continue \u2192"));
}

/* ---------------- START NEW CASE ---------------- */
function StartNewCaseScreen({
  onStart
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      background: '#19495F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(PmButton, {
    label: "Start New Case",
    variant: "green",
    size: "xl",
    onClick: onStart,
    style: {
      width: 560,
      height: 120,
      fontSize: 44
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 40,
      left: 40,
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: ASSETS + 'pmind-logo.svg',
    style: {
      width: 48,
      height: 48
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'AinslieSansNorm','Archivo',sans-serif",
      fontWeight: 700,
      fontSize: 28,
      color: '#D9E0A4'
    }
  }, "pMinds")));
}

/* ---------------- PATIENT INFORMATION ---------------- */
function PatientInfoScreen({
  onContinue
}) {
  const [first, setFirst] = useStateS('');
  const [last, setLast] = useStateS('');
  const [dob, setDob] = useStateS('');
  const canContinue = first.trim() && last.trim() && dob.trim();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      background: 'linear-gradient(150deg, #378088 0%, #1A485F 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 900,
      background: 'rgba(255,255,255,0.95)',
      borderRadius: 12,
      padding: '64px 80px',
      boxShadow: '0 5px 20px rgba(0,0,0,.15)'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "'AinslieSansNorm','Archivo',sans-serif",
      fontWeight: 700,
      fontSize: 48,
      color: '#19485F',
      textAlign: 'center',
      margin: '0 0 48px',
      lineHeight: 1.2
    }
  }, "Patient Information"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(PmInput, {
    value: first,
    onChange: setFirst,
    placeholder: "First Name"
  }), /*#__PURE__*/React.createElement(PmInput, {
    value: last,
    onChange: setLast,
    placeholder: "Last Name"
  }), /*#__PURE__*/React.createElement(PmInput, {
    value: dob,
    onChange: setDob,
    placeholder: "Date of Birth (MM/DD/YYYY)",
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "28",
      height: "28",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "18",
      rx: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "2",
      x2: "16",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "2",
      x2: "8",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "10",
      x2: "21",
      y2: "10"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(PmButton, {
    label: canContinue ? 'Continue' : 'Fill in the information',
    variant: "primary",
    size: "lg",
    full: true,
    disabled: !canContinue,
    onClick: onContinue,
    style: {
      height: 72,
      fontSize: 32
    }
  })))));
}

/* ---------------- TEST OVERVIEW – Page 1 (intro) ---------------- */
function OverviewIntroScreen({
  onNext
}) {
  const [step, setStep] = useStateS(0);
  const steps = ['This assessment includes 8 games.', 'In each game, you will first be provided with the instructions…', '… then you will have an opportunity to practice…', '… and finally you will play the real game!', 'After the games, you will answer some questions about your daily life.'];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      background: 'linear-gradient(150deg, #246A8D 0%, #10384C 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '80px 60px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.1)',
      padding: '32px 80px',
      borderRadius: 4,
      marginBottom: 64
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "'AinslieSansNorm','Archivo',sans-serif",
      fontWeight: 700,
      fontSize: 52,
      color: '#FFFFFF',
      margin: 0,
      lineHeight: 1.1
    }
  }, "Overview")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'AinslieSansNorm','Archivo',sans-serif",
      fontWeight: 500,
      fontSize: 48,
      color: '#FFFFFF',
      textAlign: 'center',
      maxWidth: 1200,
      lineHeight: 1.4
    }
  }, steps[step])), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 24
    }
  }, steps.map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: i === step ? '#D9E0A4' : 'rgba(255,255,255,0.3)'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(PmButton, {
    label: "Back",
    variant: "ghost",
    size: "md",
    disabled: step === 0,
    onClick: () => setStep(Math.max(0, step - 1)),
    style: {
      color: '#FFFFFF',
      borderColor: '#FFFFFF'
    }
  }), /*#__PURE__*/React.createElement(PmButton, {
    label: step < steps.length - 1 ? 'Next' : 'See the games →',
    variant: "green",
    size: "md",
    onClick: () => step < steps.length - 1 ? setStep(step + 1) : onNext()
  })));
}

/* ---------------- TEST OVERVIEW – Page 2 (game tiles) ---------------- */
function OverviewGamesScreen({
  onStart
}) {
  const games = [{
    id: 'digit-span',
    label: 'Digit Span Test',
    logo: ASSETS + 'digit-span-logo.svg'
  }, {
    id: 'verbal',
    label: 'Verbal Fluency',
    logo: ASSETS + 'verbal-fluency-logo.svg'
  }, {
    id: 'dsst',
    label: 'Digit Symbol Test',
    logo: ASSETS + 'digit-symbol-logo-2.svg'
  }, {
    id: 'trail',
    label: 'Trail Making B',
    logo: ASSETS + 'trail-making-logo-2.svg'
  }, {
    id: 'stroop',
    label: 'Stroop Color-Word',
    logo: ASSETS + 'stroop-color-word-test-logo.svg'
  }, {
    id: 'flanker',
    label: 'The Flanker',
    logo: ASSETS + 'the-flanker-logo.svg'
  }, {
    id: 'counting',
    label: 'Counting Span',
    logo: ASSETS + 'counting-span-logo.svg'
  }, {
    id: 'clock',
    label: 'Clock Drawing',
    logo: ASSETS + 'clock-drawing-logo.svg'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      background: 'linear-gradient(150deg, #246A8D 0%, #10384C 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '48px 60px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.1)',
      padding: '24px 80px',
      borderRadius: 4,
      marginBottom: 40
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "'AinslieSansNorm','Archivo',sans-serif",
      fontWeight: 700,
      fontSize: 44,
      color: '#FFFFFF',
      margin: 0
    }
  }, "8 Games")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 24,
      maxWidth: 1400,
      marginBottom: 48
    }
  }, games.map(g => /*#__PURE__*/React.createElement(PmGameTile, _extends({
    key: g.id
  }, g)))), /*#__PURE__*/React.createElement(PmButton, {
    label: "I'm Ready to Start",
    variant: "green",
    size: "xl",
    onClick: onStart,
    style: {
      width: 560,
      height: 96
    }
  }));
}

/* ---------------- DIGIT SPAN (sample game screen) ---------------- */
function DigitSpanScreen({
  onExit,
  percent = 0
}) {
  const [showing, setShowing] = useStateS(3);
  useEffectS(() => {
    const id = setInterval(() => setShowing(s => s < 9 ? s + 1 : 0), 800);
    return () => clearInterval(id);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      background: '#FFFCF2',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(PmHeaderBar, {
    title: "Digit Span",
    percent: percent,
    onMenu: onExit
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'AinslieSansNormBook','Archivo',sans-serif",
      fontSize: 24,
      color: '#70858F',
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      marginBottom: 24
    }
  }, "Watch carefully\u2026"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'ArialBlack','Arial Black',sans-serif",
      fontWeight: 900,
      fontSize: 320,
      color: '#19485F',
      lineHeight: 1
    }
  }, showing), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 48,
      display: 'flex',
      gap: 8
    }
  }, [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      width: 24,
      height: 4,
      borderRadius: 2,
      background: n <= showing ? '#19485F' : '#D6D5D3'
    }
  })))));
}

/* ---------------- HADS QUESTIONNAIRE ---------------- */
function HADSScreen({
  onExit,
  onDone,
  percent = 80
}) {
  const [q, setQ] = useStateS(0);
  const [answers, setAnswers] = useStateS({});
  const questions = [{
    prompt: 'I feel tense or "wound up":',
    options: ['Most of the time', 'A lot of the time', 'From time to time, occasionally', 'Not at all']
  }, {
    prompt: 'I still enjoy the things I used to enjoy:',
    options: ['Definitely as much', 'Not quite so much', 'Only a little', 'Hardly at all']
  }, {
    prompt: 'I get a sort of frightened feeling as if something awful is about to happen:',
    options: ['Very definitely and quite badly', 'Yes, but not too badly', 'A little, but it doesn\'t worry me', 'Not at all']
  }];
  const curr = questions[q];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      background: 'linear-gradient(150deg, #3A728E 0%, #0D374C 100%)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.95)'
    }
  }, /*#__PURE__*/React.createElement(PmProgressBar, {
    percent: percent
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40
    }
  }, /*#__PURE__*/React.createElement(PmQuestionCard, {
    n: q + 1,
    total: questions.length,
    prompt: curr.prompt,
    options: curr.options,
    value: answers[q],
    onChange: v => setAnswers(a => ({
      ...a,
      [q]: v
    }))
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '24px 60px'
    }
  }, /*#__PURE__*/React.createElement(PmButton, {
    label: "\u2190 Back",
    variant: "ghost",
    size: "md",
    style: {
      color: '#FFFFFF',
      borderColor: 'rgba(255,255,255,0.4)'
    },
    disabled: q === 0,
    onClick: () => setQ(Math.max(0, q - 1))
  }), /*#__PURE__*/React.createElement(PmButton, {
    label: q < questions.length - 1 ? 'Next →' : 'Finish',
    variant: "green",
    size: "md",
    disabled: answers[q] === undefined,
    onClick: () => q < questions.length - 1 ? setQ(q + 1) : onDone()
  })));
}

/* ---------------- END PAGE ---------------- */
function EndScreen({
  onRestart
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      background: '#19495F',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: ASSETS + 'pmind-logo.svg',
    alt: "pMinds",
    style: {
      width: 260,
      height: 240,
      marginBottom: 40,
      filter: 'drop-shadow(0 6px 12px rgba(0,0,0,.3))'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'AinslieSansNorm','Archivo',sans-serif",
      fontWeight: 800,
      fontSize: 88,
      color: '#D9E0A4',
      marginBottom: 28
    }
  }, "Thank You"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'AinslieSansNormBook','Archivo',sans-serif",
      fontSize: 28,
      color: 'rgba(255,255,255,0.9)',
      textAlign: 'center',
      maxWidth: 820,
      lineHeight: 1.5,
      marginBottom: 56
    }
  }, "You've completed this assessment.", /*#__PURE__*/React.createElement("br", null), "The results have been saved and will be reviewed by your clinician."), /*#__PURE__*/React.createElement(PmButton, {
    label: "Start Another Case",
    variant: "green",
    size: "lg",
    onClick: onRestart
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 40,
      fontFamily: "'AinslieSansNorm','Archivo',sans-serif",
      fontSize: 20,
      color: 'rgba(255,255,255,0.5)'
    }
  }, "Pascall Systems, Inc."));
}
Object.assign(window, {
  WelcomeScreen,
  StartNewCaseScreen,
  PatientInfoScreen,
  OverviewIntroScreen,
  OverviewGamesScreen,
  DigitSpanScreen,
  HADSScreen,
  EndScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pminds/Screens.jsx", error: String((e && e.message) || e) }); }

})();
