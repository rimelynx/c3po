Promise.all([dom.contentLoaded, crypto.generateKeyPair()]).then(start);

function start(args) {
  let keyPair = args[1];
  let votes = new Votes();

  crypto.exportPublicKey(keyPair.publicKey).then(publicKeyData => {
    dom.setValue("public_key", buffer.toBase64(publicKeyData));
  });
  dom.addClickListener("add", addVote);
  dom.addClickListener("sum", summarizeVotes);

  function addVote() {
    let ciphertext = buffer.fromBase64(dom.getValue("ballot"));
    crypto.decrypt(keyPair.privateKey, ciphertext).then(plaintext => {
      votes.add(buffer.toString(plaintext));
      document.getElementById("count").textContent = votes.total;
      // Clear the ballot after reading to avoid repeated additions.
      dom.clearValue("ballot");
    });
  }

  function summarizeVotes() {
    // Forget the private key when producing a summary.
    keyPair.privateKey = null;
    dom.clearValue("public_key");
    dom.setValue("summary", votes.summarize());
  }
}
