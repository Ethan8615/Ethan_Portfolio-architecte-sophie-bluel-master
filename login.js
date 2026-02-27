const form = document.getElementById('loginForm')
const error = document.getElementById('error')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  error.textContent = ''

  const login = document.getElementById('login').value
  const mdp = document.getElementById('mdp').value

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ login, mdp })
    })

    if (!response.ok) {
      throw new Error('Login ou mot de passe incorrect')
    }

    const data = await response.json()

    localStorage.setItem('token', data.token)

    window.location.href = 'index.html'
  } catch (err) {
    error.textContent = err.message
  }
})
