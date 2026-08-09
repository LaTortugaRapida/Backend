const math = require("./utils/math");
const capitalize = require("./utils/strings");

console.log(math.add(2, 3));
console.log(math.subtract(10, 4));
console.log(math.multiply(3, 5));
console.log(capitalize('hello'));

console.log(require.cache);
//require.cache contains the modules that Node.js already loaded,
//because require() loads and caches modules so they can be reused