dom.contentLoaded.then(start);

function start(args) {
  let privateKey = null;
  let votes = null;

  dom.addClickListener("more", addOption);
  dom.addClickListener("create", createPoll);

  function addOption() {
    let option = document.createElement("input");
    option.name = "option";
    let button = document.getElementById("more");
    dom.prependSibling(button, option);
    dom.prependSibling(button, " ");
  }

  function createPoll() {
    forgetKey();
    clearVotes();

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
    poll.multi = document.getElementsByName("multi")[0].checked;
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
      let vote = JSON.parse(buffer.toString(plaintext));
      if (document.getElementsByName("multi")[0].checked) {
        votes.addMultiple(vote);
      } else {
        votes.addOne(vote[0] || "-");
      }
      document.getElementById("count").textContent = votes.total;
      // Clear the ballot after reading to avoid repeated additions.
      dom.clearValue("ballot");
    });
  }

  function summarizeVotes() {
    forgetKey();
    dom.setValue("summary", votes.summarize());
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

  function clearVotes() {
    votes = new Votes();
    dom.clearValue("summary");
    document.getElementById("count").textContent = 0;
  }
}
