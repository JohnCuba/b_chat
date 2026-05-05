package viewModule

import (
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/static"
)

type ViewController struct {}

func NewController() *ViewController {
	return &ViewController{}
}

func (vc *ViewController) Register(app *fiber.App) {
	app.Get("/*", static.New("./public", static.Config{
		Compress: true,
		MaxAge:   0,
	}))

	app.Get("*", static.New("./public/index.html", static.Config{
		Compress: true,
		MaxAge:   31536000,
	}))
}
