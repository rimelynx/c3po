class Votes {
  constructor() {
    this.map = {};  // Maps vote strings to counts.
    this.total = 0;  // Total vote count.
  }

  addOne(vote) {
    this.addMultiple([vote]);
  }

  addMultiple(vote) {
    for (let option of new Set(vote)) {
      this.map[option] = (this.map[option] || 0) + 1;  // Increment the count.
    }
    this.total++;
  }

  summarize() {
    return Object.keys(this.map)
        .map(key => [key, this.map[key]])  // Turn the map into array.
        .sort((a, b) => b[1] - a[1])  // Reverse sort.
        .map(keyValue => keyValue[0] + ': ' + keyValue[1])  // Pretty print.
        .join("\n");  // Multiline.
  }
}
