import { now, handleEvents, sequence } from './util.mjs'

export const LENGTH_MIN = 15
export const GROWTH_INCREMENT = 25

const LENGTH_MAX = 1000
const RADIUS = 10
const SPEED = 4
const SPEED_INCREMENT = 0.1
const SPEED_MAX = 10
const SPEED_MIN = 1
const TAIL_DEFAULT = { x: 0, y: 0, radius: RADIUS }
const TURN_RATE = 0.1

const emptyArray = n => Array(n).fill(null)
const times = (n, callback) => emptyArray(n).map(callback)

const grow = (weem, increment = GROWTH_INCREMENT) => {
  times(increment, () => {
    const { x, y } =
      weem.tail.length > 0 ? weem.tail[weem.tail.length - 1] : weem.prev
    weem.tail.push({ weem, ...TAIL_DEFAULT, x, y })
  })
}

const shrink = (weem, decrement = 1) => {
  times(decrement, () => weem.tail.pop())
}

const getID = sequence()

const build = (width, height, inputID) => {
  const id = getID()
  const [initialX, initialY] = [width / 2, height / 2]
  const weem = {
    id,
    inputID,
    x: initialX,
    y: initialY,
    rotation: -Math.PI / 2,
    radius: RADIUS,
    speed: SPEED,
    prev: {
      x: initialX,
      y: initialY,
    },
    tail: [],
    events: [],
  }
  grow(weem, LENGTH_MIN)
  return weem
}

const add = ({ width, height, weems, inputID }) => {
  const weem = build(width, height, inputID)
  weems.push(weem)
}

const moveTail = weem => {
  const {
    prev: { x, y },
    tail,
  } = weem
  const neck = { weem, ...TAIL_DEFAULT, x, y }
  tail.unshift(neck)
  tail.pop()
}

const move = ({ width, height, input }, weem) => {
  if (input.grow) grow(weem, 1)

  if (input.shrink) shrink(weem)

  if (input.left) weem.rotation -= TURN_RATE
  if (input.right) weem.rotation += TURN_RATE
  weem.rotation %= 2 * Math.PI
  if (weem.rotation < 0) weem.rotation += 2 * Math.PI

  if (input.up) weem.speed += SPEED_INCREMENT
  if (input.down) weem.speed -= SPEED_INCREMENT
  if (weem.speed < SPEED_MIN) weem.speed = SPEED_MIN

  const dx = weem.speed * Math.cos(weem.rotation)
  const dy = weem.speed * Math.sin(weem.rotation)
  weem.prev.x = weem.x
  weem.prev.y = weem.y
  weem.x += dx
  weem.y += dy

  weem.x = Math.max(0, weem.x)
  weem.x = Math.min(weem.x, width)
  weem.y = Math.max(0, weem.y)
  weem.y = Math.min(weem.y, height)

  moveTail(weem)
}

const update = state => {
  const { weems } = state
  weems.forEach(weem => {
    handleEvents(weem, ({ segment, type }) => {
      switch (type) {
        case 'ate':
          grow(weem)
          break
        case 'bitten':
          const breakPoint = weem.tail.indexOf(segment)
          weem.tail.splice(breakPoint)
          break
        default:
      }
    })
    move(state, weem)
  })
}

const init = ({ inputID, config: { width, height } }) => {
  const weems = []
  add({ width, height, weems, inputID })
  return weems
}

export default { init, update }