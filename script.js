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

  let bonusUsedToDenyBane = false;
  let bestIndex = -1;
  let bestGain = 0;

  // 1. Prioritize upgrading a 1 to deny Bane
  if (bonus > 0) {
    for (let i = 0; i < allRolls.length; i++) {
      if (allRolls[i].value === 1) {
        bestIndex = i;
        bestGain = 0;
        break;
      }
    }
  }

  // 2. If no 1 to upgrade, try to maximize success gain
  if (bestIndex === -1) {
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
  }

  // Apply bonus if any
  if (bestIndex !== -1 && bonus > 0) {
    allRolls[bestIndex].modified += bonus;
    allRolls[bestIndex].usedBonus = true;

    // Check if bonus upgraded a 1 (deny bane)
    if (allRolls[bestIndex].value === 1 && allRolls[bestIndex].modified > 1) {
      bonusUsedToDenyBane = true;
    }
  }

  // Check for Bane: any die originally 1 and still 1 after bonus
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

  // Corrected message order:
  if (bonusUsedToDenyBane) {
    resultHTML += `<h3 style="color: orange;">🛡️ Bane denied (1 was upgraded by bonus)</h3>`;
  } else if (hasBane) {
    resultHTML += `<h3 style="color: red;">⚠️ Bane triggered (at least one die rolled a 1)</h3>`;
  } else {
    resultHTML += `<h3 style="color: green;">No Bane</h3>`;
  }

  output.innerHTML = resultHTML;
}
