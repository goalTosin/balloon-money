/**
 * @type {<V = any>(values: V[], chances: number[])=> V}
 */
// /**
//  * @namespace {getRandomValBasedOnChance<V>}
//  * @param {V[]} values 
//  * @param {number[]} chances 
//  * @returns {V}
//  */
function getRandomValBasedOnChance(values, chances) {
  let cumulativeChances = [];
  let sum = 0;
  for (let chance of chances) {
    sum += chance;
    cumulativeChances.push(sum);
  }
  const random = Math.random() * sum;
  for (let i = 0; i < cumulativeChances.length; i++) {
    if (random < cumulativeChances[i]) {
      return values[i];
    }
  }
}


function genRandHex(digits) {
  return Math.round(Math.random() * (16 ** digits - 1));
}
