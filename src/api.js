
const BASE_URL = 'https://jsonplaceholder.typicode.com'

export class ApiError extends Error {
  constructor(status, mensagem) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
  }
}

async function requisicao(caminho, opcoes = {}) {
  let resp

  try {
    resp = await fetch(`${BASE_URL}${caminho}`, {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        ...opcoes.headers,
      },
    })
  } catch (erro) {
    throw erro
  }

  if (!resp.ok) {
    throw new ApiError(resp.status, resp.statusText)
  }

  if (resp.status === 204) {
    return null
  }

  return await resp.json()
}

export function apiGet(caminho, opcoes = {}) {
  return requisicao(caminho, { ...opcoes, method: 'GET' })
}

export function apiPost(caminho, dados, opcoes = {}) {
  return requisicao(caminho, {
    ...opcoes,
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function apiPut(caminho, dados, opcoes = {}) {
  return requisicao(caminho, {
    ...opcoes,
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export function apiDelete(caminho, opcoes = {}) {
  return requisicao(caminho, { ...opcoes, method: 'DELETE' })
}
