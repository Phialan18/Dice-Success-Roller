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

  // 1. Try to maximize successes
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

  // 2. If no success gain, try to deny Bane by upgrading a 1
  if (bestGain === 0 && bonus > 0) {
    for (let i = 0; i < allRolls.length; i++) {
      if (allRolls[i].value === 1) {
        bestIndex = i;
        break;
      }
    }
  }

  // 3. Apply the bonus if valid index
  if (bestIndex !== -1 && bonus > 0) {
    const roll = allRolls[bestIndex];
    roll.modified = roll.value + bonus;
    roll.usedBonus = true;

    if (roll.value === 1 && roll.modified > 1) {
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

  // Bane message
  if (bonusUsedToDenyBane) {
    resultHTML += `<h3 style="color: orange;">🛡️ Bane denied (1 was upgraded by bonus)</h3>`;
  } else if (hasBane) {
    resultHTML += `<h3 style="color: red;">⚠️ Bane triggered (at least one die rolled a 1)</h3>`;
  } else {
    resultHTML += `<h3 style="color: green;">No Bane</h3>`;
  }

  output.innerHTML = resultHTML;
}

function saveRoll() {
  const input = document.getElementById("diceInput").value.trim();
  if (!input) return;

  const name = prompt("Name this roll setup:");
  if (!name) return;

  let saved = JSON.parse(localStorage.getItem("savedRolls") || "{}");
  saved[name] = input;
  localStorage.setItem("savedRolls", JSON.stringify(saved));
  renderSavedRolls();
}

function renderSavedRolls() {
  const container = document.getElementById("savedRolls");
  const saved = JSON.parse(localStorage.getItem("savedRolls") || "{}");
  container.innerHTML = "<h3>Saved Rolls:</h3>";

  Object.entries(saved).forEach(([name, expression]) => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.onclick = () => document.getElementById("diceInput").value = expression;

    const del = document.createElement("button");
    del.textContent = "✖";
    del.style.marginLeft = "8px";
    del.onclick = () => {
      delete saved[name];
      localStorage.setItem("savedRolls", JSON.stringify(saved));
      renderSavedRolls();
    };

    const wrapper = document.createElement("div");
    wrapper.style.marginBottom = "5px";
    wrapper.appendChild(btn);
    wrapper.appendChild(del);
    container.appendChild(wrapper);
  });
}

// Render saved rolls on page load
window.addEventListener("load", renderSavedRolls);
