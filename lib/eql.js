
// Taken from node's assert module, because it sucks
// and exposes next to nothing useful.

module.exports = _deepEqual;

var pSlice = Array.prototype.slice;

function _deepEqual(actual, expected, objs, ids) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected)
    return true;

  if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
    if (actual.length != expected.length) return false;
    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }
    return true;
  }

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  if (actual instanceof Date && expected instanceof Date)
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == "object",
  // equivalence is determined by ==.
  if (typeof actual != 'object' && typeof expected != 'object')
    return actual === expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical "prototype" property. Note: this
  // accounts for both named and indexed properties on Arrays.

  // initialize objs and ids if not initialized
  if (!objs) {
    objs = [];
    ids = [];
  }
  var indexOfActual = objs.indexOf(actual);
  var indexOfExpected = objs.indexOf(expected);
  if (indexOfActual >= 0 && indexOfExpected >= 0)
    return ids[indexOfActual] === ids[indexOfExpected];

  if (indexOfActual < 0 && indexOfExpected < 0) {
    id = objs.push(actual, expected);
    ids.push(id, id);
  } else if (indexOfActual < 0) {
    objs.push(actual);
    ids.push(ids[indexOfExpected]);
  } else {
    objs.push(expected);
    ids.push(ids[indexOfActual]);
  }
  return objEquiv(actual, expected, objs, ids);
}

function isUndefinedOrNull (value) {
  return value === null || value === undefined;
}

function isArguments (object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv (a, b, objs, ids) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical "prototype" property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    if (a === b)
      return true;
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, objs, ids);
  }
  var ka, kb, key, i;
  try{
    ka = Object.keys(a);
    kb = Object.keys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], objs, ids))
      return false;
  }
  return true;
}
