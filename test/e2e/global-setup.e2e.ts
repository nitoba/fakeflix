import { execSync } from 'child_process'
import path from 'path'

export default async function () {
  const composeFilePath = path.resolve(__dirname, 'docker-compose.yml')
  console.log('Arquivo Compose:', composeFilePath)

  try {
    execSync(`docker compose -f ${composeFilePath} up -d`, {
      stdio: 'inherit',
    })
    console.log('Docker Compose iniciado com sucesso')
  } catch (error) {
    console.error('Erro ao iniciar Docker Compose:', (error as Error).message)
  }

  return async () => {
    try {
      execSync(`docker compose -f ${composeFilePath} down`, {
        stdio: 'inherit',
      })
      console.log('Docker Compose desligado com sucesso')
    } catch (error) {
      console.error(
        'Erro ao desligar Docker Compose:',
        (error as Error).message,
      )
    }
  }
}
