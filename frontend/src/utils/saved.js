import Dexie from "dexie";

const initDatabase = (collectionName, fields) => {
  const db = new Dexie(`${collectionName}DB`);
  db.version(1).stores({
    [collectionName]: `id,${fields},_timestamp`,
  });
  const add = async (data) => {
    const extendedData = { ...data, _timestamp: Date.now() };
    const ID = extendedData.id;
    let suffix = 2;
    while (true) {
      try {
        /* eslint-disable no-await-in-loop */
        await db[collectionName].add(extendedData)
        break;
      } catch (err) {
        if (err instanceof Dexie.ConstraintError) {
          extendedData.id = `${ID}-${suffix}`;
          suffix++;
        }
        else throw err
      }
    }
  };
  const put = async (data) => db[collectionName].put(data)
  const del = (id) => db[collectionName].delete(id);
  const getAll = () => db[collectionName].orderBy("_timestamp").reverse().toArray();
  return { add, del, put, getAll }
}

export {initDatabase}
