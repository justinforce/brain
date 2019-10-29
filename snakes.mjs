import { now, handleEvents } from './util.mjs'

const GROW_COOLDOWN = 1000
const GROWTH_INCREMENT = 25
const LENGTH_MAX = 1000
const LENGTH_MIN = 15
const RADIUS = 10
const SPEED = 3
const SPEED_INCREMENT = 0.1
const SPEED_MAX = 10
const SPEED_MIN = 1
const TURN_RATE = 0.1

const emptyArray = n => Array(n).fill(null)
const times = (n, callback) => emptyArray(n).map(callback)

const grow = (snake, increment = GROWTH_INCREMENT) => {
  times(increment, () => {
    const { x, y } =
      snake.tail.length > 0 ? snake.tail[snake.tail.length - 1] : snake.prev
    snake.tail.push({ snake, x, y })
  })
  snake.growCooldown = now()
}

const shrink = (snake, decrement = 1) => {
  times(decrement, () => snake.tail.pop())
}

const build = (width, height) => {
  const [initialX, initialY] = [width / 2, height / 2]
  const snake = {
    x: initialX,
    y: initialY,
    rotation: -Math.PI / 2,
    radius: RADIUS,
    speed: SPEED,
    growCooldown: 0,
    prev: {
      x: initialX,
      y: initialY,
    },
    tail: [],
    events: [],
  }
  grow(snake, LENGTH_MIN)
  return snake
}

const add = ({ width, height, snakes }) => {
  const snake = build(width, height)
  snakes.push(snake)
}

const moveTail = snake => {
  const { prev, tail } = snake
  const neck = { snake, ...prev }
  tail.unshift(neck)
  tail.pop()
}

const growCooldownOK = snake => now() - snake.growCooldown > GROW_COOLDOWN

const move = (
  { width, height, input: { left, right, up, down, btnA, btnB } },
  snake
) => {
  if (btnA && growCooldownOK(snake)) grow(snake)

  if (btnB) shrink(snake)

  if (left) snake.rotation -= TURN_RATE
  if (right) snake.rotation += TURN_RATE
  snake.rotation %= 2 * Math.PI
  if (snake.rotation < 0) snake.rotation += 2 * Math.PI

  if (up) snake.speed += SPEED_INCREMENT
  if (down) snake.speed -= SPEED_INCREMENT
  if (snake.speed < SPEED_MIN) snake.speed = SPEED_MIN

  const dx = snake.speed * Math.cos(snake.rotation)
  const dy = snake.speed * Math.sin(snake.rotation)
  snake.prev.x = snake.x
  snake.prev.y = snake.y
  snake.x += dx
  snake.y += dy

  snake.x = Math.max(0, snake.x)
  snake.x = Math.min(snake.x, width)
  snake.y = Math.max(0, snake.y)
  snake.y = Math.min(snake.y, height)

  moveTail(snake)
}

const update = state => {
  const { snakes } = state
  snakes.forEach(snake => {
    handleEvents(snake, event => {
      switch (event) {
        case 'ate':
          grow(snake)
          break
        default:
      }
    })
    move(state, snake)
  })
}

const init = ({ width, height }) => {
  const snakes = []
  add({ width, height, snakes })
  return snakes
}

export default { init, update }
