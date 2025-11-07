type Teacher = {
  name: string;
  subject: string;
};

type Availability = Record<string, boolean>;
type TimetableRecord = Record<string, any>;

class TimetableBuilder {
  periods: number;
  classes: number;
  teachers: Teacher[];
  subjects: string[];
  availability: Availability;
  timetable: TimetableRecord;
  breakAfter: number;

  constructor(p: number = 8, c: number = 12, t: Teacher[], b: number) {
    this.periods = p;
    this.classes = c;
    this.teachers = [...t];
    this.subjects = this.teachers.map((t) => t.subject).filter(Boolean);
    this.availability = {};
    this.timetable = {};
    this.breakAfter = b;

    this.init();
  }

  updateLocalStorage(): void {
    localStorage.setItem("tt_teachers", JSON.stringify(this.teachers));
    localStorage.setItem("tt_table", JSON.stringify(this.timetable));
  }

  init(): void {
    const storedTeachers = localStorage.getItem("tt_teachers");
    const storedAvailability = localStorage.getItem("tt_availability");
    const storedTable = localStorage.getItem("tt_table");

    this.teachers = storedTeachers
      ? JSON.parse(storedTeachers)
      : this.teachers.slice();
    this.availability = storedAvailability
      ? JSON.parse(storedAvailability)
      : {};
    this.timetable = storedTable ? JSON.parse(storedTable) : {};

    this.setupEventListeners();
    this.renderTeachers();
    this.renderRecordTable();
    this.updateLocalStorage();
  }

  renderTeachers(): void {
    const el = document.getElementById("teacher-list");
    if (!el) return;
    el.innerHTML = "";

    this.teachers.forEach((t, i) => {
      const div = document.createElement("div");
      div.className =
        "flex justify-between items-center bg-slate-900 rounded p-2 me-2 border border-slate-700";
      div.innerHTML = `
        <div>
          <div class='font-semibold'>${t.name}</div>
          <div class='text-slate-400 text-xs'>${t.subject}</div>
        </div>
      `;

      const del = document.createElement("button");
      del.textContent = "✕";
      del.className = "text-sm px-2 py-1 bg-red-600 rounded hover:bg-red-700";
      del.onclick = () => {
        this.teachers.splice(i, 1);
        this.renderTeachers();
        this.updateLocalStorage();
      };

      div.appendChild(del);
      el.appendChild(div);
    });
  }

  addTeacher(name: string, subject: string): void {
    const isNew = this.teachers.every(
      (t) => t.name !== name || t.subject !== subject
    );
    if (isNew) {
      this.teachers.push({ name, subject });
      this.teachers.sort((a, b) => a.name.localeCompare(b.name));
      this.renderTeachers();
      this.renderRecordTable();
      this.updateLocalStorage();
    } else {
      alert("Teacher already exists");
    }
  }
  updateDropdowns(): void {
    // Track used teachers in each row & column
    const usedInRow: Record<string, Set<string>> = {};
    const usedInCol: Record<string, Set<string>> = {};

    for (const key in this.timetable) {
      const [col, row] = key.split("_"); // e.g. "C3", "P4"
      const teacher = this.timetable[key].teacher;
      if (!usedInRow[row]) usedInRow[row] = new Set();
      if (!usedInCol[col]) usedInCol[col] = new Set();
      usedInRow[row].add(teacher);
      usedInCol[col].add(teacher);
    }

    // update each select
    document
      .querySelectorAll<HTMLSelectElement>(".teacher-select")
      .forEach((select) => {
        const key = select.dataset.key!;
        const [col, row] = key.split("_");
        const blocked = new Set([
          ...(usedInRow[row] || []),
          // ...(usedInCol[col] || []), // this is blocked
        ]);

        select.querySelectorAll("option").forEach((opt) => {
          if (opt.value === "") return; // skip default
          opt.disabled = blocked.has(opt.value) && opt.value !== select.value;
          opt.style.color = opt.disabled ? "#888" : "";
        });
      });

    this.updateLocalStorage();
  }

  renderRecordTable(): void {
    const table = document.getElementById(
      "timetable-grid"
    ) as HTMLTableElement | null;
    if (!table) return;

    table.innerHTML = "";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");

    const firstTh = document.createElement("th");
    firstTh.className = "text-center p-2";
    firstTh.textContent = "Class / Period";
    headRow.appendChild(firstTh);

    for (let p = 1; p <= this.periods; p++) {
      const th = document.createElement("th");
      th.className = "p-2 text-center";
      th.textContent = `P${p}`;
      headRow.appendChild(th);

      // Insert a "BREAK" column after chosen period
      if (this.breakAfter && p === this.breakAfter) {
        const breakTh = document.createElement("th");
        breakTh.className = "p-2 text-center bg-blue-900 text-white font-bold";
        breakTh.textContent = "BREAK";
        headRow.appendChild(breakTh);
      }
    }

    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    for (let c = 1; c <= this.classes; c++) {
      const tr = document.createElement("tr");

      const classTh = document.createElement("th");
      classTh.className = "p-2 text-center";
      classTh.textContent = `${c}`;
      tr.appendChild(classTh);

      for (let p = 1; p <= this.periods; p++) {
        const key = `C${c}_P${p}`;
        const td = document.createElement("td");
        td.className = "p-2 border-0 hover:bg-slate-700 rounded cursor-pointer";

        const select = document.createElement("select");
        select.id = `teacher-select-${key}`;
        select.className =
          "teacher-select bg-slate-900 text-white rounded p-1 w-full border border-slate-700";
        select.dataset.key = key;
        select.title = "";

        const defaultOpt = document.createElement("option");
        defaultOpt.value = "";
        defaultOpt.textContent = "- Select -";
        select.appendChild(defaultOpt);

        this.teachers.forEach((t) => {
          const opt = document.createElement("option");
          opt.value = `${t.name} (${t.subject})`;
          opt.textContent = `${t.name} (${t.subject})`;
          select.appendChild(opt);
        });

        if (this.timetable[key]) {
          select.value = this.timetable[key].teacher;
          select.title = this.timetable[key].subject;
        }

        select.addEventListener("change", () => {
          const selectedTeacher = select.value;
          const [teacher, subject] = selectedTeacher.split("_");

          select.title = subject;

          if (teacher) {
            this.timetable[key] = { teacher, subject };
          } else {
            delete this.timetable[key];
          }

          this.updateDropdowns();
        });

        td.appendChild(select);
        tr.appendChild(td);

        // Insert a break column after the chosen period
        if (this.breakAfter && p === this.breakAfter) {
          const breakTd = document.createElement("td");
          breakTd.className =
            "text-center font-bold bg-blue-900 text-white tracking-wider";
          breakTd.textContent = "BREAK";
          tr.appendChild(breakTd);
        }
      }

      tbody.appendChild(tr);
    }

    table.appendChild(tbody);

    this.updateDropdowns();
  }

  updateClasses(): void {
    const classInput = document.getElementById(
      "number-of-classes"
    ) as HTMLInputElement | null;

    if (!classInput) return;

    const numberOfClasses = classInput.value ? parseInt(classInput.value) : 8;

    this.classes = numberOfClasses;
    this.renderRecordTable();
  }

  updatePeriods(): void {
    const periodInput = document.getElementById(
      "number-of-periods"
    ) as HTMLInputElement | null;

    if (!periodInput) return;

    const numberOfPeriods = periodInput.value ? parseInt(periodInput.value) : 8;

    this.periods = numberOfPeriods;
    this.renderRecordTable();
    this.updateLocalStorage();
  }

  updateBreakTime(): void {
    const breakInput = document.getElementById(
      "lunch-break"
    ) as HTMLInputElement | null;

    if (!breakInput) return;

    const lunchBreakTime = breakInput.value
      ? parseInt(breakInput.value, 10)
      : 4;

    this.breakAfter = lunchBreakTime;
    this.renderRecordTable();
    this.updateLocalStorage();
  }

  setupEventListeners(): void {
    //add teacher button
    const btn = document.getElementById(
      "add-teacher"
    ) as HTMLButtonElement | null;
    const nameInput = document.getElementById(
      "teacher-name"
    ) as HTMLInputElement | null;
    const subjectInput = document.getElementById(
      "teacher-subject"
    ) as HTMLInputElement | null;

    if (!btn || !nameInput || !subjectInput) return;

    btn.onclick = () => {
      const n = nameInput.value.trim();
      const s = subjectInput.value.trim();
      if (!n || !s) return alert("Enter name and subject");
      this.addTeacher(n, s);
    };

    //reset timetable button
    const resetBtn = document.getElementById(
      "reset-timetable"
    ) as HTMLButtonElement | null;
    if (!resetBtn) return;

    resetBtn.onclick = () => {
      this.timetable = {};
      this.updateLocalStorage();
      this.renderRecordTable();
    };

    //update classes button
    const classBtn = document.getElementById(
      "number-of-classes"
    ) as HTMLInputElement | null;
    if (!classBtn) return;

    classBtn.onchange = () => {
      this.updateClasses();
    };

    //update break time button
    const breakBtn = document.getElementById(
      "add-break"
    ) as HTMLInputElement | null;
    if (!breakBtn) return;

    breakBtn.onclick = () => {
      this.updateBreakTime();
    };
    //update periods button
    const periodBtn = document.getElementById(
      "number-of-periods"
    ) as HTMLInputElement | null;
    if (!periodBtn) return;

    periodBtn.onchange = () => {
      this.updatePeriods();
    };

    //download button
    const downloadBtn = document.getElementById(
      "download-btn"
    ) as HTMLButtonElement | null;
    if (!downloadBtn) return;

    downloadBtn.onclick = () => {
      const printable = document.getElementById("timetable-grid");
      if (!printable) return;

      // --- Deep clone the table (structure only) ---
      const clone = printable.cloneNode(true) as HTMLElement;

      // --- Copy selected values from original selects to cloned ones ---
      const originalSelects = printable.querySelectorAll(".teacher-select");
      const clonedSelects = clone.querySelectorAll(".teacher-select");

      originalSelects.forEach((orig, i) => {
        const cloneSelect = clonedSelects[i] as HTMLSelectElement;
        const origSelect = orig as HTMLSelectElement;
        cloneSelect.value = origSelect.value; // copy selected value
      });

      // --- Replace cloned <select> elements with plain text spans ---
      clone.querySelectorAll(".teacher-select").forEach((el) => {
        const select = el as HTMLSelectElement;
        const selectedText =
          select.options[select.selectedIndex]?.textContent || "";
        const span = document.createElement("span");
        span.textContent = selectedText;
        span.className = "teacher-print-value";
        select.replaceWith(span);
      });

      // --- Open new print window ----
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      printWindow.document.write(`
        <html>
          <head>
            <title>School Timetable</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                background: #fff;
                color: #000;
              }
              table {
                border-collapse: collapse;
                width: 100%;
              }
              th, td {
                border: 1px solid #333;
                padding: 8px;
                text-align: center;
              }
              th {
                background-color: #f4f4f4;
              }
              .teacher-print-value {
                display: inline-block;
                min-width: 100px;
              }
            </style>
          </head>
          <body>
            <h2>School Timetable</h2>
            ${clone.outerHTML}
          </body>
        </html>
      `);

      printWindow.document.close();

      // --- Wait for render before print ---
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    };
  }
}

// Initialize on load
window.onload = () => {
  try {
    const classInput = document.getElementById(
      "number-of-classes"
    ) as HTMLInputElement;
    if (!classInput) return;

    if (!classInput.value) {
      classInput.value = "8";
    }


    const numberOfClasses = parseInt(classInput.value, 10);
    const lunchBreak = document.getElementById(
      "lunch-break"
    ) as HTMLInputElement;

    if (!lunchBreak) return;
    if (!lunchBreak.value) {
      lunchBreak.value = "4";
    }

    let teachers: { name: string; subject: string }[] = [];

    const data = localStorage.getItem("tt_teachers");
    const parsed = data ? JSON.parse(data) : [];
    teachers =
      Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : [{ name: "Test Teacher", subject: "English" }];

    const lunchBreakTime = parseInt(lunchBreak.value, 10);

    const numberOfPeriods = document.getElementById(
      "number-of-periods"
    ) as HTMLInputElement;
    if (!numberOfPeriods) return;

    if (!numberOfPeriods.value) {
      numberOfPeriods.value = "8";
    }

    const periods = parseInt(numberOfPeriods.value, 10);

    new TimetableBuilder(periods, numberOfClasses, teachers, lunchBreakTime);
  } catch (error) {
    console.warn(
      "Invalida data in localStorage. Please clear the local storage and reload the page.",
      error
    );
  }
};
