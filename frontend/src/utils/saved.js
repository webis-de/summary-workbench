import Dexie from "dexie";

const initDatabase = (collectionName, fields) => {
  const db = new Dexie(`${collectionName}DB`);
  db.version(1).stores({
    [collectionName]: `id,${fields},_timestamp`,
  });
  const collection = db[collectionName]
  const add = async (data) => {
    const id = data.id.trim()
    if (!id) throw new Error("NOID")
    const extendedData = { ...data, id, _timestamp: Date.now() };
    try {
      await collection.add(extendedData);
    } catch (err) {
      if (err instanceof Dexie.ConstraintError) throw new Error("TAKEN")
      throw err;
    }
    return true;
  };
  const getAll = () => collection.orderBy("_timestamp").reverse().toArray();
  return { collection, add, getAll };
};

export { initDatabase };
