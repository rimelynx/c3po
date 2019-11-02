function test(name, syncFunction) {
  asyncTest(name, async () => syncFunction());
}

function asyncTest(name, asyncFunction) {
  let div = document.createElement("div");
  div.style.padding = "0.5em";
  div.style.color = "white";
  div.innerHTML = name + ": ";
  asyncFunction().then(() => {
    div.style.background = "green";
    div.innerHTML += "OK";
  }).catch(error => {
    div.style.background = "red";
    div.innerHTML += error;
  }).finally(() => {
    if (!document.body) {
      document.body = document.createElement("body");
    }
    document.body.append(div);
  });
}
