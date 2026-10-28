
import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from './api'

function App() {
  const [usuarios, setUsuarios] = useState([])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [editando, setEditando] = useState(null)
  const [erro, setErro] = useState('')

  function tratarErro(erro) {
    if (erro instanceof ApiError) {
      if (erro.status === 404) {
        setErro('Recurso não encontrado')
      } else if (erro.status === 500) {
        setErro('Erro no servidor')
      } else {
        setErro(`Erro HTTP ${erro.status}`)
      }
    } else if (erro instanceof TypeError) {
      setErro('Falha de rede')
    } else {
      setErro('Ocorreu um erro inesperado')
    }
  }

  useEffect(() => {
    const controller = new AbortController()

    async function carregarUsuarios() {
      try {
        setErro('')
        const dados = await apiGet('/users', {
          signal: controller.signal,
        })
        setUsuarios(dados)
      } catch (erro) {
        if (erro.name !== 'AbortError') {
          tratarErro(erro)
        }
      }
    }

    carregarUsuarios()

    return () => {
      controller.abort()
    }
  }, [])

  async function salvarUsuario(e) {
    e.preventDefault()
    setErro('')

    const dados = { name: nome, email }

    try {
      if (editando !== null) {
        await apiPut(`/users/${editando}`, dados)

        setUsuarios((listaAtual) =>
          listaAtual.map((usuario) =>
            usuario.id === editando
              ? { ...usuario, ...dados }
              : usuario
          )
        )
      } else {
        const novoUsuario = await apiPost('/users', dados, {
          headers: {
            'X-Custom': 'aula07',
          },
        })

        setUsuarios((listaAtual) => [
          ...listaAtual,
          { ...novoUsuario, ...dados },
        ])
      }

      setNome('')
      setEmail('')
      setEditando(null)
    } catch (erro) {
      tratarErro(erro)
    }
  }

  function editarUsuario(usuario) {
    setEditando(usuario.id)
    setNome(usuario.name)
    setEmail(usuario.email)
    setErro('')
  }

  async function excluirUsuario(id) {
    setErro('')

    try {
      await apiDelete(`/users/${id}`)

      setUsuarios((listaAtual) =>
        listaAtual.filter((usuario) => usuario.id !== id)
      )
    } catch (erro) {
      tratarErro(erro)
    }
  }

  return (
    <main>
      <h1>CRUD de Usuários</h1>

      {erro && <p role="alert">{erro}</p>}

      <form onSubmit={salvarUsuario}>
        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">
          {editando !== null ? 'Salvar edição' : 'Cadastrar usuário'}
        </button>

        {editando !== null && (
          <button
            type="button"
            onClick={() => {
              setEditando(null)
              setNome('')
              setEmail('')
              setErro('')
            }}
          >
            Cancelar edição
          </button>
        )}
      </form>

      <h2>Usuários cadastrados</h2>

      {usuarios.map((usuario) => (
        <div key={usuario.id}>
          <p>
            {usuario.name} — {usuario.email}
          </p>

          <button onClick={() => editarUsuario(usuario)}>
            Editar
          </button>

          <button onClick={() => excluirUsuario(usuario.id)}>
            Excluir
          </button>
        </div>
      ))}
    </main>
  )
}

export default App
