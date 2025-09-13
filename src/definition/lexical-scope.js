var count = 1;
const btn = document.createElement("button");
btn.innerText = "Click me";
document.body.appendChild(btn);
btn.addEventListener("click", function () {
  count++;
  console.log("Count: ", count);
})
