const readFile = (file) => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onerror = () => {
      reader.abort();
      reject(new DOMException("Problem parsing input file."));
    };

    reader.onload = () => {
      console.log(reader.result)
      resolve(reader.result);
    };
    reader.readAsText(file);
  });
};

export { readFile };
