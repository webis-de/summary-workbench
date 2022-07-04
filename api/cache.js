const LRU = require("lru-cache")
const crypto = require("crypto")

const flatten = (obj, refs) => {
  if (ArrayBuffer.isView(obj) || typeof(obj) === "string") return [obj]
  if (typeof obj !== "object") return [obj.toString()]
  const newRefs = refs || new Set()
  if (newRefs.has(obj)) return []
  newRefs.add(obj)
  if (Array.isArray(obj)) return obj.flatMap(e => flatten(e, newRefs))
  return Object.entries(obj).flatMap(([key, value]) => [key, ...flatten(value, newRefs)])
}

const options = { max: 500 }

const cache = new LRU(options)

const buildKey = (args, definition) => {
  if (!definition.buildtag || !definition.instancetag) return undefined
  const sha256 = crypto.createHash('sha256')
  flatten(args).forEach((e) => sha256.update(e))
  const argHash = sha256.digest('hex');
  return `${definition.buildtag}:${definition.instancetag}:${argHash}`
}

const add = (results, plugins, definitions) => {
  Object.entries(results).forEach(([modelKey, data]) => {
    const key = buildKey(plugins[modelKey].args, definitions[modelKey])
    if (!data.errors) cache.set(key, data)
  })
}

const get = (plugins, definitions) => {
  const cached = {}
  const nonCached = {}

  Object.entries(plugins).forEach(([modelKey, {args}]) => {
    const key = buildKey(args, definitions[modelKey])
    if (key) {
      const cacheEntry = cache.get(key)
      if (cacheEntry !== undefined) {
        cached[modelKey] = cacheEntry;
        return
      }
    }
    nonCached[modelKey] = plugins[modelKey]
  });
  return [cached, nonCached]
}

module.exports = {add, get}
