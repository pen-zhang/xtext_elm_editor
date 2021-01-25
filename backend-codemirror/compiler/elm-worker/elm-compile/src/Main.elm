module Main exposing (..)

import GraphicSVG exposing(..)
import GraphicSVG.App exposing(..)
import Shapes exposing (..)


-- MAIN

main : GraphicsApp
main = graphicsApp { view=view }

-- View

view : Collage userMsg
view = collage 500 500 myShapes


