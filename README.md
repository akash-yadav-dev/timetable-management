# 🕒 Timetable Builder

A simple, browser-based **Timetable Builder** built with **HTML, CSS (Tailwind CSS)**, and **JavaScript**.
It allows users to manage teachers, subjects, and class periods to dynamically generate and update a timetable.
All data is stored locally in the browser for persistence.

---

## 🚀 Features

* **Add Teachers & Subjects**
  Easily add teacher names and their assigned subjects.

* **Adjust Timetable Settings**
  Configure number of periods, number of classes, and lunch break settings.

* **Dynamic Table Generation**
  Automatically builds a class timetable based on user input.

* **Edit & Update**
  Click on any timetable cell to edit it directly.

* **Persistent Data**
  Saves your data in the browser using Local Storage.

* **Export**
  Download the generated timetable as a PDF.

* **Responsive Design**
  Fully responsive interface built using Tailwind CSS.

---

## 🧩 Project Structure

```
timetable-builder/
│
├── index.html      # Main HTML structure
├── style.css       # Tailwind-generated or custom styles
├── script.js       # Handles JS logic (generated from script.ts)
└── README.md       # Project documentation
```

---

## ⚙️ Setup & Usage

### 🪄 Option 1 — Quick Start (Using Tailwind CDN)

If you’re using the Tailwind CDN (uncommented in your HTML):

```html
<script src="https://cdn.tailwindcss.com"></script>
```

Just open **`index.html`** directly in your browser — no build step required.

---

### ⚡ Option 2 — Optimized Build (Recommended)

To generate a compiled CSS file with **only the classes you use**, follow these steps:

#### 1️⃣ Install Tailwind CSS

```bash
npm install -D tailwindcss
npx tailwindcss init
```

#### 2️⃣ Update `tailwind.config.js`

```js
module.exports = {
  content: ["./*.html", "./js/**/*.js"],
  theme: { extend: {} },
  plugins: [],
};
```

#### 3️⃣ Create `input.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 4️⃣ Build your final stylesheet

```bash
npx tailwindcss -i ./input.css -o ./style.css --minify
```

#### 5️⃣ Run the Project

Open `index.html` in your browser and you’re good to go 🚀

---

## 🖱️ How to Use

1. **Add Teachers**
   Enter a teacher’s name and subject, then click **“Add Teacher”**.

2. **Set Up Timetable**
   Adjust the number of periods, classes, and lunch break as needed.

3. **Generate Timetable**
   The timetable updates dynamically based on your inputs.

4. **Edit Timetable**
   Click on any timetable cell to assign or modify a teacher/subject.

5. **Export**
   Click **“Download PDF”** to save your timetable.

6. **Reset**
   Click **“Reset Timetable”** to clear all saved data.

---

## 🧠 Technologies Used

* **HTML5**
* **Tailwind CSS**
* **Vanilla JavaScript**
* **LocalStorage API**

---

## 📦 Future Improvements

* Add CSV import/export for teacher data
* Include validation for form inputs
* Add drag-and-drop scheduling for teachers
* Enable color-coded subjects or teachers

---

## 🧑‍💻 Author

**Akash Yadav**
📧 [akashyadav171156@gmail.com](mailto:akashyadav171156@gmail.com)
💻 [github.com/akash-yadav-dev](https://github.com/akash-yadav-dev)

---

## 📄 License

This project is licensed under the **MIT License** — feel free to modify and use it as you like.

---

### ✨ Happy Scheduling! 🗓️
