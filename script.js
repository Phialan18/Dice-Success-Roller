function rollDice() {
  const input = document.getElementById("diceInput").value;
  const output = document.getElementById("output");
  output.innerHTML = "";

  // Match dice groups like 2d8, 1d6
  const diceRegex = /(\d+)d(\d+)/g;
  const bonusRegex = /\+(\d+)\s*$/;

  const diceGroups = [...input.matchAll(diceRegex)];
  const bonusMatch = input.match(bonusRegex);
  const bonus = bonusMatch ? parseInt(bonusMatch[1]) : 0;

  let allRolls = [];

  for (const group of diceGroups) {
    const count = parseInt(group[1]);
    const sides = parseInt(group[2]);

    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      allRolls.push({ value: roll, modified: roll });
    }
  }

  // Function to calculate success from a value
  function getSuccesses(val) {
    if (val >= 20) return 5;
    if (val >= 16) return 4;
    if (val >= 12) return 3;
    if (val >= 8) return 2;
    if (val >= 4) return 1;
    return 0;
  }

  // Determine the best die to apply the bonus to
  let bestIndex = -1;
  let bestGain = 0;

  for (let i = 0; i < allRolls.length; i++) {
    const original = allRolls[i].value;
    const successBefore = getSuccesses(original);
    const successAfter = getSuccesses(original + bonus);
    const gain = successAfter - successBefore;

    if (gain > bestGain) {
      bestGain = gain;
      bestIndex = i;
    }
  }

  // Apply bonus if it's beneficial
  if (bestIndex !== -1 && bonus > 0) {
    allRolls[bestIndex].modified += bonus;
    allRolls[bestIndex].usedBonus = true;
  }

  // Calculate total successes
  let totalSuccesses = 0;
  let resultHTML = "<h2>Results:</h2><ul>";

  allRolls.forEach((roll, index) => {
    const succ = getSuccesses(roll.modified);
    totalSuccesses += succ;
    resultHTML += `<li>Roll ${index + 1}: ${roll.value}${roll.usedBonus ? ` +${bonus} → ${roll.modified}` : ""} = ${succ} success${succ !== 1 ? "es" : ""}</li>`;
  });

  resultHTML += `</ul><h3>Total Successes: ${totalSuccesses}</h3>`;
  output.innerHTML = resultHTML;
}