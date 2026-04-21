const HomePage = () => {
  return (
    <main>
      <div class="hero bg-base-200 min-h-screen">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold">Привет это b_c<i>hat</i></h1>
            <p class="py-6">
              Мгновенные чаты. Анонимно. Приватно.
            </p>
            <div class="flex justify-center gap-4">
              <a
                class="btn btn-soft btn-success"
                href="/create"
              >
                создать
              </a>
              <a
                href="/join"
                class="btn btn-soft btn-accent"
              >
                войти
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default HomePage;