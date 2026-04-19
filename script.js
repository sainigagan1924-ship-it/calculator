const display = document.querySelector("[data-display]");
const historyLine = document.querySelector("[data-history]");
const keys = document.querySelector(".keys");
const themeToggle = document.querySelector("[data-theme-toggle]");

let expression = "";
let justEvaluated = false;

const operators = new Set(["+", "-", "*", "/"]);

function formatExpression(value) {
  return value
    .replaceAll("*", "x")
    .replaceAll("/", "/")
    .replaceAll("-", "-")
    .replaceAll("+", "+");
}

function updateDisplay(value = expression || "0") {
  display.value = formatExpression(value);
}

function currentNumber() {
  const parts = expression.split(/[+\-*/]/);
  return parts[parts.length - 1] || "";
}

function appendValue(value) {
  const last = expression.at(-1);

  if (justEvaluated && !operators.has(value)) {
    expression = "";
  }

  if (value === ".") {
    if (currentNumber().includes(".")) {
      return;
    }
    if (!expression || operators.has(last)) {
      expression += "0";
    }
  }

  if (operators.has(value)) {
    justEvaluated = false;

    if (!expression && value !== "-") {
      return;
    }

    if (operators.has(last)) {
      expression = expression.slice(0, -1) + value;
      updateDisplay();
      return;
    }
  }

  expression += value;
  justEvaluated = false;
  updateDisplay();
}

function clearCalculator() {
  expression = "";
  justEvaluated = false;
  historyLine.innerHTML = "&nbsp;";
  updateDisplay();
}

function deleteLast() {
  if (justEvaluated) {
    clearCalculator();
    return;
  }

  expression = expression.slice(0, -1);
  updateDisplay();
}

function applyPercent() {
  const match = expression.match(/(-?\d+\.?\d*)$/);

  if (!match) {
    return;
  }

  const value = Number(match[0]) / 100;
  expression = expression.slice(0, match.index) + String(value);
  updateDisplay();
}

function calculate() {
  if (!expression || operators.has(expression.at(-1))) {
    return;
  }

  try {
    const total = Function(`"use strict"; return (${expression})`)();

    if (!Number.isFinite(total)) {
      throw new Error("Invalid calculation");
    }

    const rounded = Number.parseFloat(total.toFixed(10));
    historyLine.textContent = `${formatExpression(expression)} =`;
    expression = String(rounded);
    justEvaluated = true;
    updateDisplay(expression);
  } catch {
    historyLine.textContent = "Try a different calculation";
    expression = "";
    display.value = "Error";
    justEvaluated = true;
  }
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const { value, action } = button.dataset;

  if (value) {
    appendValue(value);
  }

  if (action === "clear") {
    clearCalculator();
  }

  if (action === "delete") {
    deleteLast();
  }

  if (action === "percent") {
    applyPercent();
  }

  if (action === "equals") {
    calculate();
  }
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^\d$/.test(key) || key === ".") {
    appendValue(key);
  }

  if (operators.has(key)) {
    appendValue(key);
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
  }

  if (key === "Backspace") {
    deleteLast();
  }

  if (key === "Escape") {
    clearCalculator();
  }

  if (key === "%") {
    applyPercent();
  }
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark")
    ? "Day"
    : "Night";
});

updateDisplay();
