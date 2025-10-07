package main

import (
    "github.com/gin-gonic/gin"
)

func main()  {
    router := gin.New()
    router.Static("/static", "./html")

    router.GET("/", func(ctx *gin.Context) {
        ctx.File("./html/home.html")
    })

    router.GET("/sepuluhkb", func(ctx *gin.Context) {
        ctx.File("./html/10kb.html")
    })
    
    router.GET("/seratuskb", func(ctx *gin.Context) {
        ctx.File("./html/100kb.html")
    })

    router.GET("/satumb", func(ctx *gin.Context) {
        ctx.File("./html/1024kb.html")
    })

    router.GET("/limamb", func(ctx *gin.Context) {
        ctx.File("./html/5120kb.html")
    })
    router.GET("/sepuluhmb", func(ctx *gin.Context) {
        ctx.File("./html/10240kb.html")
    })
    router.Run(":8080")
}
