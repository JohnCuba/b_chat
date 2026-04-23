import './style.css'

const HomePage = () => {
  return (
    <main>
      <div class="hero bg-base-200 min-h-screen">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold">Привет это <span class="text-success">b_c</span><i>hat</i></h1>
            <p class="py-6">
              Мгновенные чаты. Анонимно. Приватно.
            </p>
            <a
              class="btn btn-success"
              href="/start"
            >
              начать
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

export default HomePage;
