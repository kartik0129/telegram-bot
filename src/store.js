import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, '..', 'subscribers.json')

function load() {
  if (!existsSync(DB_PATH)) return []
  try {
    return JSON.parse(readFileSync(DB_PATH, 'utf-8'))
  } catch {
    return []
  }
}

function save(subscribers) {
  writeFileSync(DB_PATH, JSON.stringify(subscribers, null, 2))
}

export function addSubscriber(chatId) {
  const list = load()
  if (!list.includes(chatId)) {
    list.push(chatId)
    save(list)
  }
  return list
}

export function removeSubscriber(chatId) {
  const list = load().filter(id => id !== chatId)
  save(list)
  return list
}

export function getAllSubscribers() {
  return load()
}

export function isSubscribed(chatId) {
  return load().includes(chatId)
}
