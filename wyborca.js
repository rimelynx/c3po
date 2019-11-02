dom.contentLoaded.then(start);

function start() {
  dom.addClickListener("encrypt", encryptVote);

  function encryptVote() {
    let publicKeyData = buffer.fromBase64(dom.getValue("public_key"));
    crypto.importPublicKey(publicKeyData).then(publicKey => {
      var plaintext = buffer.fromString(dom.getValue("vote"));
      return crypto.encrypt(publicKey, plaintext)
    }).then(ciphertext => {
      dom.setValue("ballot", buffer.toBase64(ciphertext));
    });
  }
}
