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
              <button class="btn btn-soft btn-success">
                создать
              </button>
              <button class="btn btn-soft btn-accent">
                присоединиться
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default HomePage;