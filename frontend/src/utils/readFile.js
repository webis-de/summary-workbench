const readFile = (file, binary=false) => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onerror = () => {
      reader.abort();
      reject(new DOMException("Problem parsing input file."));
    };

    reader.onload = () => {
      resolve(reader.result);
    };
    if (binary) reader.readAsArrayBuffer(file)
    else reader.readAsText(file);
  });
};

export { readFile };
