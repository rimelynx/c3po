dom.contentLoaded.then(start);

function start(args) {
  let privateKey = null;
  let votes = null;

  dom.preventFormSubmissions();
  dom.addClickListener("more", addOption);
  dom.addClickListener("create", createPoll);

  function addOption() {
    let button = document.getElementById("more");
    let option = document.getElementsByName("option")[0].cloneNode(true);
    option.value = "";
    dom.prependSibling(button, option);
    dom.prependSibling(button, " ");
  }

  function newVote() {
    votes = new Votes(document.getElementById("max").value);
    dom.clearValue("summary");
    document.getElementById("count").textContent = 0;
  }

  function createPoll() {
    forgetKey();
    newVote();

    let poll = {
      options: []
    };
    let options = document.getElementsByName("option");
    for (let option of options) {
      if (option.value) {
        poll.options.push(option.value);
      }
    }
    if (!poll.options.length) {
      return;
    }
    poll.max = votes.maxOptions;
    let pollData = buffer.fromString(JSON.stringify(poll));

    crypto.generateKeyPair().then(keyPair => {
      privateKey = keyPair.privateKey;
      return crypto.exportPublicKey(keyPair.publicKey);
    }).then(publicKeyData => {
      dom.setValue("key", buffer.toBase64(pollData) + "_" +
                          buffer.toBase64(publicKeyData));
      dom.addClickListener("add", addVote);
      dom.addClickListener("sum", summarizeVotes);
    });
  }

  function addVote() {
    let ballot = dom.getValue("ballot");
    if (!ballot) {
      return;
    }
    let ciphertext = buffer.fromBase64(ballot);
    crypto.decrypt(privateKey, ciphertext).then(plaintext => {
      votes.add(JSON.parse(buffer.toString(plaintext)));
      document.getElementById("count").textContent = votes.total;
      // Clear the ballot after reading to avoid repeated additions.
      dom.clearValue("ballot");
    });
  }

  function summarizeVotes() {
    if (window.confirm(document.getElementById("sum").dataset.confirm)) {
      forgetKey();
      dom.setValue("summary", votes.summarize());
    }
  }

  function forgetKey() {
    if (!privateKey) {
      return;
    }
    dom.removeListeners("sum");
    dom.removeListeners("add");
    privateKey = null;
    dom.clearValue("key");
  }
}
