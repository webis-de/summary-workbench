const zip = (rows) => rows[0].map((_, c) => rows.map((row) => row[c]));
const range = (count) => [...Array(count).keys()];

export { zip, range };
