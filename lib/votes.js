class Votes {
  constructor() {
    this.map = {};  // Maps vote strings to counts.
    this.total = 0;  // Total vote count.
  }

  add(vote) {
    this.map[vote] = (this.map[vote] || 0) + 1;  // Increment the count.
    this.total++;
  }

  summarize() {
    return Object.keys(this.map)
        .map((key) => {
          return [key, this.map[key]];  // Turn the map into array.
        })
        .sort((a, b) => {
          return b[1] - a[1];  // Reverse sort.
        })
        .map((keyValue) => {
          return keyValue[0] + ': ' + keyValue[1];  // Pretty print.
        })
        .join("\n");  // Multiline.
  }
}
