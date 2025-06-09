const columns = document.querySelectorAll(".column");

function saveState() {
  const state = {};
  columns.forEach((col) => {
    const id = col.dataset.id;
    const cards = Array.from(col.querySelectorAll(".card")).map((card) =>
      card.textContent.trim()
    );
    state[id] = cards;
  });
  localStorage.setItem("trelloState", JSON.stringify(state));
}

function loadState() {
  const state = JSON.parse(localStorage.getItem("trelloState"));
  if (!state) return;
  for (const [columnId, cards] of Object.entries(state)) {
    const col = document.querySelector(`.column[data-id="${columnId}"]`);
    col.querySelectorAll(".card").forEach((card) => card.remove());
    cards.forEach((text) => {
      const card = createCard(text);
      col.insertBefore(card, col.querySelector(".add-btn"));
    });
  }
}

function createCard(text) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.textContent = text;

  const remove = document.createElement("span");
  remove.textContent = "✖";
  remove.classList.add("remove");
  remove.onclick = () => {
    card.remove();
    saveState();
  };
  card.appendChild(remove);

  card.setAttribute("draggable", true);
  card.ondragstart = (e) => {
    e.dataTransfer.setData("text/plain", text);
    card.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/id", Math.random().toString()); // dummy id
    e.dataTransfer.setDragImage(card, 10, 10); // курсор не в центре
  };
  card.ondragend = () => card.classList.remove("dragging");

  return card;
}

document.querySelectorAll(".add-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const text = prompt("Card text:");
    if (text) {
      const col = btn.closest(".column");
      const card = createCard(text);
      col.insertBefore(card, btn);
      saveState();
    }
  });
});

columns.forEach((column) => {
  column.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(column, e.clientY);
    const dragging = document.querySelector(".dragging");
    if (afterElement == null) {
      column.insertBefore(dragging, column.querySelector(".add-btn"));
    } else {
      column.insertBefore(dragging, afterElement);
    }
  });

  column.addEventListener("drop", () => {
    saveState();
  });
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".card:not(.dragging)"),
  ];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

loadState();
