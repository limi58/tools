import readline from 'readline'

export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

export function q(msg: string) {
  return new Promise<string>((resolve, reject) => {
    rl.question(`${msg} >`, (input) => {
      resolve(input)
    })
  })
}
