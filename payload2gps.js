/* Converts a location package in hexadecimal bytes to floating point coordinates.
First we convert to an integer, then we convert that to a float, which is almost
correct aside from some coordinate calculations.
*/

// Credit to: https://github.com/thesolarnomad/lora-serialization/blob/master/src/decoder.js
var bytes2Int = function(bytes) {
  var i = 0;
  for (var x = 0; x < bytes.length; x++) {
    i |= +(bytes[x] << (x * 8));
  }
  return i;
};

// Credit to: https://stackoverflow.com/a/16001019
function bytes2Float32(bytes) {
  var sign = (bytes & 0x80000000) ? -1 : 1;
  var exponent = ((bytes >> 23) & 0xFF) - 127;
  var significand = (bytes & ~(-1 << 23));

  if (exponent == 128)
    return sign * ((significand) ? Number.NaN : Number.POSITIVE_INFINITY);

  if (exponent == -127) {
    if (significand == 0) return sign * 0.0;
    exponent = -126;
    significand /= (1 << 22);
  }
  else significand = (significand | (1 << 23)) / (1 << 23);

  return sign * significand * Math.pow(2, exponent);
}


function float2Coord(float) {
  orderOfMagnitude = 1000;
  if (-1000 < float < 1000) {
    orderOfMagnitude /= 10;
  }

  rough = Math.floor(float / orderOfMagnitude);
  return rough + ((float - (rough * orderOfMagnitude)) / 60);
}

function Decoder(bytes, port) {
  // Check if it is a location package
  if (bytes[1] == 1) {
    var lat = float2Coord(bytes2Float32(bytes2Int(bytes.slice(2, 6))));
    var lng = float2Coord(bytes2Float32(bytes2Int(bytes.slice(6, 12))));

    // Coordinates are generally precise upto 5 decimal places
    return {"Coordinaten": [parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5))]};
  }

  return {}
}