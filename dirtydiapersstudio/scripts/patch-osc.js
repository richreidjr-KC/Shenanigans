const fs = require("fs");
const path = require("path");

function write(relPath, content) {
  const full = path.join(__dirname, "..", relPath);
  fs.writeFileSync(full, content);
}

write("node_modules/osc/src/platforms/osc-node-serialport.js",
`module.exports = function () { return null; };`
);

write("node_modules/osc/src/platforms/osc-node-serialport-loader.js",
`module.exports = null;`
);

const oscNodePath = "node_modules/osc/src/platforms/osc-node.js";
let oscNode = fs.readFileSync(path.join(__dirname, "..", oscNodePath), "utf8");

oscNode = oscNode
  .replace(/require\\(".*osc-node-serialport-loader\\.js"\\)/, "// serialport disabled")
  .replace(/osc\\.supportsSerial = true;/, "osc.supportsSerial = false;");

write(oscNodePath, oscNode);

console.log("OSC serialport patch applied.");
