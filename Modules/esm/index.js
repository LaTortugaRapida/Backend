import { add, subtract, multiply } from "./utils/math.js";
import { capitalize } from "./utils/strings.js";

console.log(add(2, 3));
console.log(subtract(10, 4));
console.log(multiply(3, 5));
console.log(capitalize('hello'));

console.log(import.meta.url);
//import.meta.url provides the current module's URL,
//because __filename does not exist in ES Modules