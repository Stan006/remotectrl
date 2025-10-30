const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

const burger = document.getElementById("hamburger");
const menu = document.getElementById("mobileMenu");
burger.addEventListener("click", () => {
  menu.style.display = menu.style.display === "block" ? "none" : "block";
});
menu.querySelectorAll("a").forEach(a =>
  a.addEventListener("click", () => (menu.style.display = "none"))
);

const navlinks = [...document.querySelectorAll(".navlink")];
const sections = navlinks.map(a => document.querySelector(a.getAttribute("href")));
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    const id = `#${e.target.id}`;
    const link = navlinks.find(a => a.getAttribute("href") === id);
    if (link) link.classList.toggle("active", e.isIntersecting);
  });
});
sections.forEach(s => s && io.observe(s));

document.getElementById("year").textContent = new Date().getFullYear();
