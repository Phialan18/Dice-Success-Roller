function rollDice() {
  const input = document.getElementById("diceInput").value;
  const output = document.getElementById("output");
  output.innerHTML = "";

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

  function getSuccesses(val) {
    if (val >= 20) return 5;
    if (val >= 16) return 4;
    if (val >= 12) return 3;
    if (val >= 8) return 2;
    if (val >= 4) return 1;
    return 0;
  }

  let bestIndex = -1;
  let bestGain = 0;

  // First pass: try to increase success count
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

  // Second pass: if no success gain, try to remove a Bane by upgrading a 1
  if (bestGain === 0 && bonus > 0) {
    for (let i = 0; i < allRolls.length; i++) {
      if (allRolls[i].value === 1 && (allRolls[i].value + bonus) > 1) {
        bestIndex = i;
        break;
      }
    }
  }

  // Apply bonus if used
  if (bestIndex !== -1 && bonus > 0) {
    allRolls[bestIndex].modified += bonus;
    allRolls[bestIndex].usedBonus = true;
  }

  // Check for Bane:
  // If any die has original roll 1 AND modified roll is still 1 (not upgraded), Bane triggers.
  const hasBane = allRolls.some(roll => roll.value === 1 && roll.modified === 1);

  // Calculate total successes
  let totalSuccesses = 0;
  let resultHTML = "<h2>Results:</h2><ul>";

  allRolls.forEach((roll, index) => {
    const succ = getSuccesses(roll.modified);
    totalSuccesses += succ;
    resultHTML += `<li>Roll ${index + 1}: ${roll.value}${roll.usedBonus ? ` +${bonus} → ${roll.modified}` : ""} = ${succ} success${succ !== 1 ? "es" : ""}</li>`;
  });

  resultHTML += `</ul><h3>Total Successes: ${totalSuccesses}</h3>`;
  if (hasBane) {
    resultHTML += `<h3 style="color: red;">⚠️ Bane triggered (at least one die rolled a 1)</h3>`;
  } else {
    resultHTML += `<h3 style="color: green;">No Bane</h3>`;
  }

  output.innerHTML = resultHTML;
}
