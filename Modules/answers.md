1. In the CommonJS version, if you had written exports = { add, subtract,
multiply } instead of individually attaching each function to exports, what
would happen when you require() that file from index.js? Why?

    If i wrote exports = { add, subtract, multiply }, it would not expect those functions,
because exports initially points to the same object module.exports
and assighning a new object to exports only changes the local variable.

2. Why does utils/strings.js in the CJS folder use module.exports = ... while
utils/math.js uses exports.xxx = ... ? Could you have written math.js
using module.exports instead? What would change on the importing side?\

    strings.js uses module.exports = ... because it exports one functionas
the entire module, while math.js attaches several functions as properties
of existing exports object.
    I could write math.js using module.exports = ... . The same object would be
received, so i could still access all functions.

3. In the ESM version, why is the exact file extension required on import
'./utils/math.js' , when the CJS version works fine with
require('./utils/math')?

    ES Modules require the exact file extension because their module resolution
follows URL-based rules and does not automatically add .js to the import path
CommonJS require() uses Node.js's module resolution algorithm, which can
automatically look for according files.

4. Name one thing ES Modules can do that CommonJS cannot, and explain briefly
why the difference exists (hint: think about how each system loads files —
synchronously vs. not).

    ES Modules can use top-level await, while CommonJS cannot use it in the same way.
This difference exists because ES Modules are designed around asynchronous module loading
and evaluation, while CommonJS loads modules synchronously.